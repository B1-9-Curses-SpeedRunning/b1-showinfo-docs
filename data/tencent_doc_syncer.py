import os
import re
import time
import requests

from typing import Optional
from pathlib import Path
from urllib.parse import urlparse, parse_qs, unquote


accessToken = os.environ["TENCENT_ACCESS_TOKEN"]
clientId = os.environ["TENCENT_CLIENT_ID"]
openId = os.environ["TENCENT_OPEN_ID"]

baseHeaders = {
    "Access-Token": accessToken,
    "Client-Id": clientId,
    "Open-Id": openId,
}

session = requests.Session()


def convertEncodedId(encodedId: str, type_: int = 2) -> str:
    url = "https://docs.qq.com/openapi/drive/v2/util/converter"
    params = {
        "type": type_,
        "value": encodedId,
    }

    resp = session.get(url, headers=baseHeaders, params=params, timeout=30)
    resp.raise_for_status()

    result = resp.json()
    if result.get("ret") != 0:
        raise RuntimeError(f"converter 失败: {result}")

    fileId = result.get("data", {}).get("fileID")

    if not fileId:
        raise RuntimeError(f"converter 成功，但未找到 fileID: {result}")

    return str(fileId)


def startExport(fileId: str, exportType: str) -> str:
    url = f"https://docs.qq.com/openapi/drive/v2/files/{fileId}/async-export"

    headers = {
        **baseHeaders,
        "Content-Type": "application/x-www-form-urlencoded",
    }

    data = {
        "exportType": exportType,
    }

    resp = session.post(url, headers=headers, data=data, timeout=30,)
    resp.raise_for_status()

    result = resp.json()

    if result.get("ret") != 0:
        raise RuntimeError(f"导出任务创建失败: {result}")

    operationId = result["data"]["operationID"]

    return operationId


def pollExport(
    fileId: str,
    operationId: str,
    maxRetry: int = 60,
    interval: int = 2,
) -> str:
    url = f"https://docs.qq.com/openapi/drive/v2/files/{fileId}/export-progress"

    params = {
        "operationID": operationId,
    }

    for _ in range(maxRetry):
        resp = session.get(url, headers=baseHeaders, params=params, timeout=30)
        resp.raise_for_status()

        result = resp.json()

        if result.get("ret") != 0:
            raise RuntimeError(f"轮询失败: {result}")

        data = result.get("data", {})

        progress = data.get("progress", 0)

        print(f"当前导出进度: {progress}%")

        if progress >= 100:
            downloadUrl = data.get("url")

            if not downloadUrl:
                raise RuntimeError(f"导出完成，但未返回下载链接: {result}")

            return downloadUrl

        time.sleep(interval)

    raise TimeoutError("导出超时")


def inferFilename(downloadUrl: str, exportType: str) -> str:
    parsed = urlparse(downloadUrl)
    query = parse_qs(parsed.query)

    cd = query.get("response-content-disposition", [None])[0]
    if cd:
        cd = unquote(cd)

        match = re.search(r"filename\*\=UTF-8''([^;]+)", cd)
        if match:
            return unquote(match.group(1))

        match = re.search(r'filename="?([^";]+)"?', cd)
        if match:
            return match.group(1)

    name = Path(parsed.path).name
    if name and "." in name and name != ".xlsx":
        return name

    extMap = {
        "sheet": "xlsx",
        "doc": "docx",
        "pdf": "pdf",
        "csv": "csv",
        "xlsx": "xlsx",
        "docx": "docx",
    }
    ext = extMap.get(exportType, "bin")
    return f"tencent_doc_export.{ext}"


def downloadFile(downloadUrl: str, outputPath: Path) -> Path:
    outputPath.parent.mkdir(parents=True, exist_ok=True)

    with session.get(downloadUrl, stream=True, timeout=120) as resp:
        resp.raise_for_status()

        contentDisposition = resp.headers.get("Content-Disposition", "")
        match = re.search(
            r'filename\*?=(?:UTF-8\'\')?"?([^"]+)"?', contentDisposition)
        if match:
            serverName = match.group(1).strip()

            # 过滤掉这种只有扩展名的“假文件名”。
            if serverName and serverName not in {".xlsx", ".docx", ".pdf", ".csv"}:
                outputPath = outputPath.with_name(serverName)

        with open(outputPath, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

    return outputPath


def downloadTencentDoc(
    encodedId: str,
    outputDir: Path,
    exportType: str,
    converterType: int = 2,
    maxRetry: int = 60,
    interval: int = 2,
    outputFilename: Optional[str] = None,
) -> Path:
    fileId = convertEncodedId(encodedId, type_=converterType)
    operationId = startExport(fileId, exportType=exportType)
    downloadUrl = pollExport(
        fileId, operationId, maxRetry=maxRetry, interval=interval)

    if outputFilename is None:
        outputFilename = inferFilename(downloadUrl, exportType)

    outputPath = outputDir / outputFilename
    finalPath = downloadFile(downloadUrl, outputPath)
    return finalPath


def main():
    tasks = [
        {
            "encodedId": "DTUhETnNCQ0RoRm9v",
            "exportType": "sheet",
            "outputDir": Path("data/gauntlet")
        },
        {
            "encodedId": "DSnhYRENVZmNCQk9i",
            "exportType": "sheet",
            "outputDir": Path("data/rematch")
        }
    ]

    for task in tasks:
        try:
            savedPath = downloadTencentDoc(
                encodedId=task["encodedId"],
                exportType=task["exportType"],
                outputDir=task["outputDir"]
            )
            print(f'{task["encodedId"]} 下载完成: {savedPath}')

        except Exception as e:
            print(f'{task["encodedId"]} 下载失败: {e}')


if __name__ == "__main__":
    main()
