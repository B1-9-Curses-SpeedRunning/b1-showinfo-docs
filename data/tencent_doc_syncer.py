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

# 使用 Session 复用连接，减少多次 HTTP 请求的开销。
session = requests.Session()


def convertEncodedId(encodedId: str, type_: int = 2) -> str:
    """
    将腾讯文档的编码 ID 转换为真正的 fileID。
    不同类型的文档可能需要不同的 type 参数，默认按常见场景传 2。
    """
    url = "https://docs.qq.com/openapi/drive/v2/util/converter"
    params = {
        "type": type_,
        "value": encodedId,
    }

    resp = session.get(url, headers=baseHeaders, params=params, timeout=30)
    resp.raise_for_status()

    result = resp.json()
    # ret != 0 说明接口层面返回失败，不要继续往下走。
    if 0 != result.get("ret"):
        raise RuntimeError(f"converter 失败: {result}")

    fileId = result.get("data", {}).get("fileID")

    # 有些接口虽然 ret=0，但 data 里仍可能缺字段，需要再做一次兜底检查。
    if not fileId:
        raise RuntimeError(f"converter 成功，但未找到 fileID: {result}")

    return str(fileId)


def startExport(fileId: str, exportType: str) -> str:
    """
    发起异步导出任务。
    腾讯文档导出通常不是立即返回文件，而是先创建任务，再轮询进度。
    """
    url = f"https://docs.qq.com/openapi/drive/v2/files/{fileId}/async-export"

    headers = {
        **baseHeaders,
        # 明确声明表单提交格式，避免服务端解析异常。
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
    """
    轮询导出任务进度，直到导出完成并拿到下载链接。
    maxRetry 和 interval 决定了总等待时长。
    """
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

        # 打印进度，便于在 GitHub Actions 或命令行中观察导出状态。
        print(f"当前导出进度: {progress}%")

        # progress >= 100 表示导出完成，此时应拿下载地址。
        if progress >= 100:
            downloadUrl = data.get("url")

            if not downloadUrl:
                raise RuntimeError(f"导出完成，但未返回下载链接: {result}")

            return downloadUrl

        time.sleep(interval)

    # 超过最大重试次数仍未完成，直接视为超时。
    raise TimeoutError("导出超时")


def inferFilename(downloadUrl: str, exportType: str) -> str:
    """
    尝试从下载链接中推断文件名。
    优先使用服务端返回的 Content-Disposition，其次使用 URL 路径，最后回退到默认命名。
    """
    parsed = urlparse(downloadUrl)
    query = parse_qs(parsed.query)

    # 某些下载链接会把文件名放在 response-content-disposition 里。
    cd = query.get("response-content-disposition", [None])[0]
    if cd:
        cd = unquote(cd)

        # 兼容 filename*=UTF-8''xxx 这种 RFC 5987 形式。
        match = re.search(r"filename\*\=UTF-8''([^;]+)", cd)
        if match:
            return unquote(match.group(1))

        # 兼容普通 filename="xxx" 形式。
        match = re.search(r'filename="?([^";]+)"?', cd)
        if match:
            return match.group(1)

    # 如果 URL 路径本身就带文件名，优先使用。
    name = Path(parsed.path).name
    if name and "." in name and name != ".xlsx":
        return name

    # 无法识别时，根据导出类型推断扩展名。
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
    """
    真正下载文件到本地。
    如果服务端返回了更可信的文件名，则覆盖掉传入的 outputPath 文件名。
    """
    outputPath.parent.mkdir(parents=True, exist_ok=True)

    with session.get(downloadUrl, stream=True, timeout=120) as resp:
        resp.raise_for_status()

        contentDisposition = resp.headers.get("Content-Disposition", "")
        match = re.search(
            r'filename\*?=(?:UTF-8\'\')?"?([^"]+)"?', contentDisposition)
        if match:
            serverName = match.group(1).strip()

            # 有些服务端会返回仅扩展名作为“文件名”，这通常没有实际意义。
            if serverName and serverName not in {".xlsx", ".docx", ".pdf", ".csv"}:
                outputPath = outputPath.with_name(serverName)

        # 分块写入，避免大文件一次性读入内存。
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
    """
    封装完整流程：
    1. 编码 ID -> fileID
    2. 创建异步导出任务
    3. 轮询导出进度
    4. 下载文件到本地
    """
    fileId = convertEncodedId(encodedId, type_=converterType)
    operationId = startExport(fileId, exportType=exportType)
    downloadUrl = pollExport(
        fileId, operationId, maxRetry=maxRetry, interval=interval)

    # 如果外部没指定文件名，就尽量从下载链接里自动推断。
    if outputFilename is None:
        outputFilename = inferFilename(downloadUrl, exportType)

    outputPath = outputDir / outputFilename
    finalPath = downloadFile(downloadUrl, outputPath)
    return finalPath


def main():
    # 这里集中配置需要导出的任务，便于后续扩展成批处理。
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

        # 单个任务失败不影响后续任务，适合批量同步场景。
        except Exception as e:
            print(f'{task["encodedId"]} 下载失败: {e}')


if __name__ == "__main__":
    main()
