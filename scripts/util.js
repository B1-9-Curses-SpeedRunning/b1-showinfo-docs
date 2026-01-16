/**
 * @file util.js
 * @author DavidingPlus (davidingplus@qq.com)
 * @brief 将榜单单项和总榜的 Excel/JSON 数据生成完整 Markdown 文档。
 * @details 流程：
 * 1. 从 Excel 文件解析单项榜、总榜和周年连战榜，生成对应 JSON 数据。
 * 2. 读取或生成的 JSON 数据，规范化成绩为 parse-duration 可识别格式。
 * 3. 按成绩排序。（目前暂时不排序，按照腾讯文档的顺序来）
 * 4. 转换为 json2md 所需格式，包括标题和表格。
 * 5. 输出完整 Markdown 文档。
 * 
 * Copyright (c) 2025 DavidingPlus
 */
import fs from 'fs'
import json2md from 'json2md'
import XLSX from "xlsx"
import moment from 'moment'


/**
 * 将竞速成绩规范化为 parse-duration 可识别的格式。
 * 给几个例子：
 * 51''45 -> 51.45s
 * 1'17''75 -> 1m17.75s
 * 1'29'' -> 1m29s
 * 3'16''? -> 3m16s
 * @param {string} timeStr 输入时间字符串。
 * @returns {string}
 */
export function normalizeTime(timeStr) {
    timeStr = String(timeStr).trim()

    // 去掉末尾可能的 ? 号（毫秒位不知道成绩的情况，默认视为 0。
    if (timeStr.endsWith('?')) {
        timeStr = timeStr.slice(0, -1)
    }

    // 处理类似 51''45 格式的成绩。
    let match = timeStr.match(/^(\d+)''(\d+)$/)
    if (match) {
        const [, s, cs] = match
        return `${s}.${cs}s`
    }

    // 处理类似 1'17''75 格式的成绩。
    match = timeStr.match(/^(\d+)'(\d+)''(\d+)$/)
    if (match) {
        const [, m, s, cs] = match
        return `${m}m${s}.${cs}s`
    }

    // 处理类似 1'29'' 或者去掉 ? 的 3'16'' 格式的成绩。
    match = timeStr.match(/^(\d+)'(\d+)''$/)
    if (match) {
        const [, m, s] = match
        return `${m}m${s}s`
    }


    // 匹配不到，返回原串。（目前给的数据走不到这个分支）
    return timeStr
}

/**
 * 转换单项的数据，按成绩进行排序。
 * @param {string} inputJsonPath 原始 JSON 文件路径。
 * @returns {string}
 */
export function convertSingleList(inputJsonPath) {
    // 读取原始 JSON 文件。
    const rawJson = JSON.parse(fs.readFileSync(inputJsonPath, 'utf-8'))

    // 生成标题：单项。
    const markdownElements = [{ h2: '单项' }]

    // rawJson 是数组，每个元素是 { "组名": [选手数组] }
    rawJson.forEach(section => {
        const groupName = Object.keys(section)[0] // 三虎、四僧等。
        const tableData = section[groupName]

        // 生成组标题。
        const elements = [{ h3: groupName }]

        if (tableData && tableData.length > 0) {
            // 按成绩排序，快的在前（暂时不排序）
            // const sortedTable = [...tableData].sort((a, b) => {
            //     return parse(normalizeTime(a['成绩'][0])) - parse(normalizeTime(b['成绩'][0]))
            // })
            const sortedTable = [...tableData]

            // 给每行加排名。
            const tableRows = sortedTable.map((entry, index) => ({
                排名: 1 + index,
                ...entry
            }))

            // 获取列名。
            const columnNames = Object.keys(tableRows[0])

            // 构造表格内容。
            const tableContent = tableRows.map(row =>
                columnNames.map(col => {
                    const e = row[col]
                    // 若是数组且长度大于 1 代表带链接。
                    return Array.isArray(e)
                        ? (e.length > 1 ? `[${e[0]}](${e[1]})` : e[0])
                        : e
                })
            )

            elements.push({
                table: {
                    headers: columnNames,
                    rows: tableContent
                }
            })
        }

        markdownElements.push(...elements)
    })


    return json2md(markdownElements)
}

/**
 * 转换总榜的数据，按总成绩排序。
 * @param {string} inputJsonPath 原始 JSON 文件路径。
 * @returns {string}
 */
export function convertTotalList(inputJsonPath) {
    // 读取原始 JSON 文件。
    const rawJson = JSON.parse(fs.readFileSync(inputJsonPath, 'utf-8'))

    // 生成标题：总榜。
    const markdownElements = [
        { h2: '总榜' }
    ]

    // 处理每一行。
    if (rawJson.length > 0) {
        // 按照“总成绩”进行排序。（暂时不排序）
        // const sortedTable = [...rawJson].sort((a, b) => {
        //     return (a['总成绩'].length ? parse(normalizeTime(a['总成绩'])) : Infinity) - (b['总成绩'].length ? parse(normalizeTime(b['总成绩'])) : Infinity)
        // })
        const sortedTable = [...rawJson]

        // 获取列名（JSON 对象的字段名）。
        const columnNames = Object.keys(sortedTable[0])

        // 每行的数据数组。
        const tableContent = sortedTable.map(row =>
            columnNames.map(col => {
                const e = row[col]
                // 若是数组且长度大于 1 代表是带链接的成绩，需构造超链接，若只有成绩，则返回 0 号元素，去掉括号。若数组长度为 0，则是空串，返回空。
                return Array.isArray(e)
                    ? (e.length === 0 ? '' : (e.length > 1 ? `[${e[0]}](${e[1]})` : e[0]))
                    : e
            })
        )

        markdownElements.push({
            table: {
                headers: columnNames,
                rows: tableContent
            }
        })
    }


    return json2md(markdownElements)
}

/**
 * 转换周年连战榜单的数据。
 * @param {string} inputJsonPath 原始 JSON 文件路径。
 * @returns {string}
 */
export function convertAnniversaryList(inputJsonPath) {
    // 读取原始 JSON 文件。
    const rawJson = JSON.parse(fs.readFileSync(inputJsonPath, 'utf-8'))

    const markdownElements = []

    // 由于周年连战的总成绩 json 格式和单项式一样的，因此按照单项的方式处理即可。
    // rawJson 是数组，每个元素是 { "组名": [选手数组] }
    rawJson.forEach(section => {
        const groupName = Object.keys(section)[0]
        const tableData = section[groupName]

        // 生成组标题。
        const elements = [{ h2: groupName }]

        if (tableData && tableData.length > 0) {
            // 按成绩排序，快的在前（暂时不排序）
            // const sortedTable = [...tableData].sort((a, b) => {
            //     return parse(normalizeTime(a['成绩'][0])) - parse(normalizeTime(b['成绩'][0]))
            // })
            const sortedTable = [...tableData]

            // 给每行加排名。
            const tableRows = sortedTable.map((entry, index) => ({
                排名: 1 + index,
                ...entry
            }))

            // 获取列名。
            const columnNames = Object.keys(tableRows[0])

            // 构造表格内容。
            const tableContent = tableRows.map(row =>
                columnNames.map(col => {
                    const e = row[col]
                    // 若是数组且长度大于 1 代表带链接。
                    return Array.isArray(e)
                        ? (e.length > 1 ? `[${e[0]}](${e[1]})` : e[0])
                        : e
                })
            )

            elements.push({
                table: {
                    headers: columnNames,
                    rows: tableContent
                }
            })
        }

        markdownElements.push(...elements)
    })


    return json2md(markdownElements)
}

/**
 * 生成官方榜单 Markdown 文件。
 * @param {string} singleJsonPath 单项 JSON 原文件路径。
 * @param {string} totalJsonPath 总榜 JSON 原文件路径。
 * @param {string} outputMdPath 输出的 Markdown 文件路径。
 * @param {string} pageHeader 页面开头显示的标题和说明文字。
 */
export function generateOfficialRankingList(singleJsonPath, totalJsonPath, outputMdPath, pageHeader = '') {
    let content = pageHeader
    content += convertSingleList(singleJsonPath)
    content += convertTotalList(totalJsonPath)
    fs.writeFileSync(outputMdPath, content, 'utf-8')
}

/**
 * 生成周年连战榜单 Markdown 文件。
 * @param {string} anniversaryJsonPath 周年连战 JSON 原文件路径。
 * @param {string} outputMdPath 输出的 Markdown 文件路径。
 * @param {string} pageHeader 页面开头显示的标题和说明文字。
 */
export function generateAnniversaryRankingList(anniversaryJsonPath, outputMdPath, pageHeader = '') {
    let content = pageHeader
    content += convertAnniversaryList(anniversaryJsonPath)
    fs.writeFileSync(outputMdPath, content, 'utf-8')
}

/**
 * @brief 解析单项成绩表格，生成 JSON 数据。
 * @param filePath Excel 文件路径。
 * @param sheetIndex 工作表索引。
 * @param outputJsonPath 输出的 Json 文件路径。
 * @return 返回按标题分组的单项成绩 JSON。
 */
export function generateJsonSingle(filePath, sheetIndex, outputJsonPath) {
    const workbook = XLSX.readFile(filePath) // 读取 Excel 文件。
    const sheetName = workbook.SheetNames[sheetIndex] // 获取工作表名称。
    const sheet = workbook.Sheets[sheetName] // 获取工作表对象。
    const range = XLSX.utils.decode_range(sheet["!ref"]) // 获取数据范围。

    const titles = []
    // 提取第一行标题及起始列。
    for (let c = range.s.c; c <= range.e.c; ++c) {
        const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c })]
        if (cell && cell.v && String(cell.v).trim()) titles.push({ title: String(cell.v).trim(), startCol: c })
    }

    const res = []
    // 遍历每个标题列生成选手数据。
    for (const { title, startCol } of titles) {
        // 跳过不需要解析的列，如汇总或备注。
        if ("汇总" === title || "备注" === title) continue

        const arr = []

        // 从第 3 行开始遍历每个选手的数据（前两行是标题）。
        for (let r = 2; r <= range.e.r; ++r) {
            // 获取选手姓名、成绩和日期单元格。
            const nameCell = sheet[XLSX.utils.encode_cell({ r, c: startCol })]
            const scoreCell = sheet[XLSX.utils.encode_cell({ r, c: startCol + 1 })]
            const dateCell = sheet[XLSX.utils.encode_cell({ r, c: startCol + 2 })]

            // 如果姓名为空，跳过该行。
            if (!nameCell || nameCell.v == null) continue

            const name = String(nameCell.v).trim()
            // 特殊行处理：遇到破纪录次数结束，遇到前十玩家跳过。
            if ("破纪录次数(含旧榜)↓" === name) break
            if ("前十玩家↑" === name) continue

            // 读取成绩和链接。
            const score = scoreCell ? String(scoreCell.v) : ""
            const link = scoreCell?.l?.Target || ""
            // 日期优先使用格式化显示，否则取原始值。
            const date = moment(new Date((dateCell.v - 25569) * 86400 * 1000)).format("YYYY/MM/DD")

            // 构造选手对象，成绩带链接则使用数组 [成绩, 链接]。
            arr.push({
                选手: name,
                成绩: link ? [score, link] : [score],
                日期: date
            })
        }

        // 如果该组有选手数据，则添加到结果数组。
        if (arr.length > 0) res.push({ [title]: arr })
    }

    fs.writeFileSync(outputJsonPath, JSON.stringify(res, null, 4), "utf-8")
}

/**
 * @brief 解析总成绩表格，生成 JSON 数据。
 * @param filePath Excel 文件路径。
 * @param sheetIndex 工作表索引。
 * @param outputJsonPath 输出的 Json 文件路径。
 * @return 返回总成绩 JSON。
 */
export function generateJsonTotal(filePath, sheetIndex, outputJsonPath) {
    const workbook = XLSX.readFile(filePath) // 读取 Excel 文件。
    const sheetName = workbook.SheetNames[sheetIndex] // 获取工作表名称。
    const sheet = workbook.Sheets[sheetName] // 获取工作表对象。
    const range = XLSX.utils.decode_range(sheet["!ref"]) // 获取数据范围。

    const headers = []
    // 提取表头列。
    for (let c = range.s.c; c <= range.e.c; ++c) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c })
        const cell = sheet[cellAddress]
        if (cell && cell.v) headers.push({ name: cell.v, col: c })
    }

    const res = []
    // 遍历每行数据，从第二行开始（第一行是表头）。
    for (let r = range.s.r + 1; r <= range.e.r; ++r) {
        const rowObj = {}      // 存储当前行的选手信息。
        let hasName = false    // 标记这一行是否有选手姓名。

        // 遍历每列，根据表头名称解析数据。
        for (const { name: header, col: c } of headers) {
            const cellAddress = XLSX.utils.encode_cell({ r, c }) // 单元格地址。
            const cell = sheet[cellAddress]                      // 获取单元格对象。

            // 如果是选手列，检查姓名是否存在。
            if ("选手" === header) {
                if (!cell || !cell.v) break // 选手为空直接跳过整行。
                hasName = true
                rowObj["选手"] = cell.v     // 保存选手姓名。
                continue
            }

            // 如果是总成绩列。
            if ("总成绩" === header) {
                // 总成绩可能为空，如果有则直接取值，否则设为空数组。
                rowObj[header] = cell && cell.v ? cell.v : []
                continue
            }

            // 普通成绩列：若单元格有链接，则包含链接，否则仅保存成绩值。
            rowObj[header] = cell && cell.v ? (cell.l && cell.l.Target ? [cell.v, cell.l.Target] : [cell.v]) : []
        }

        // 如果行中有选手姓名，才加入结果数组。
        if (hasName) res.push(rowObj)
    }

    fs.writeFileSync(outputJsonPath, JSON.stringify(res, null, 4), "utf-8")
}

/**
 * @brief 解析周年连战成绩表格，生成 JSON 数据。
 * @param filePath Excel 文件路径。
 * @param sheetIndex 工作表索引。
 * @param outputJsonPath 输出的 Json 文件路径。
 * @return 返回按标题分组的单项成绩 JSON。
 */
export function generateJsonAnniversary(filePath, sheetIndex, outputJsonPath) {
    const workbook = XLSX.readFile(filePath) // 读取 Excel 文件。
    const sheetName = workbook.SheetNames[sheetIndex] // 获取工作表名称。
    const sheet = workbook.Sheets[sheetName] // 获取工作表对象。
    const range = XLSX.utils.decode_range(sheet["!ref"]) // 获取数据范围。

    const titles = []
    // 提取第一行标题及起始列。
    for (let c = range.s.c; c <= range.e.c; ++c) {
        const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c })]
        if (cell && cell.v && String(cell.v).trim()) titles.push({ title: String(cell.v).trim(), startCol: c })
    }

    const res = []
    // 遍历每个标题列生成选手数据。
    for (const { title, startCol } of titles) {
        // 跳过不需要解析的列，如汇总或备注。
        if ("排名" === title || "汇总" === title || "备注" === title || "历史成绩-道满归根" === title || "历史成绩-群妖聚义" === title) continue

        const arr = []

        // 从第 3 行开始遍历每个选手的数据（前两行是标题）。
        for (let r = 2; r <= range.e.r; ++r) {
            // 获取选手姓名、成绩和日期单元格。
            const nameCell = sheet[XLSX.utils.encode_cell({ r, c: startCol })]
            const scoreCell = sheet[XLSX.utils.encode_cell({ r, c: startCol + 1 })]
            // 单项成绩第三栏是日期，总成绩第三栏是奖励，需要分开处理。
            const dateOrRewardCell = sheet[XLSX.utils.encode_cell({ r, c: startCol + 2 })]

            // 如果姓名为空，跳过该行。
            if (!nameCell || nameCell.v == null) continue

            const name = String(nameCell.v).trim()
            // 特殊行处理：遇到破纪录次数结束，遇到前十玩家跳过。
            if ("破纪录次数↓" === name) break
            if ("前十玩家↑" === name) continue

            // 读取成绩和链接。
            const score = scoreCell ? String(scoreCell.v) : ""
            const link = scoreCell?.l?.Target || ""

            let dateOrReward = ""
            if ("总成绩" == title) {
                dateOrReward = dateOrRewardCell ? String(dateOrRewardCell.v) : ""
            }
            else {
                // 日期优先使用格式化显示，否则取原始值。
                dateOrReward = moment(new Date((dateOrRewardCell.v - 25569) * 86400 * 1000)).format("YYYY/MM/DD")
            }

            // 构造选手对象，成绩带链接则使用数组 [成绩, 链接]。
            if ("总成绩" == title) {
                arr.push({
                    选手: name,
                    成绩: link ? [score, link] : [score],
                    奖金: dateOrReward
                })
            }
            else {
                arr.push({
                    选手: name,
                    成绩: link ? [score, link] : [score],
                    日期: dateOrReward
                })
            }
        }

        // 如果该组有选手数据，则添加到结果数组。
        if (arr.length > 0) res.push({ [title]: arr })
    }

    fs.writeFileSync(outputJsonPath, JSON.stringify(res, null, 4), "utf-8")
}

/**
 * @brief 读取指定文件的最后修改时间并写入文件。
 * @param {string} filePath 源文件路径。
 * @param {string} outputPath 输出文件路径。
 */
export function generateLastUpdatedTime(filePath, outputPath) {
    const stats = fs.statSync(filePath)
    const lastUpdatedTime = stats.mtime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })

    fs.writeFileSync(outputPath, `${lastUpdatedTime}`, 'utf-8')
}
