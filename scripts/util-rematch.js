import fs from 'fs'
import json2md from 'json2md'
import XLSX from 'xlsx'


/**
 * @brief 读取复战榜文件的最后修改时间并写入文件。
 * @param {string} filePath 源文件路径。
 * @param {string} outputPath 输出文件路径。
 */
export function generateRematchLastUpdatedTime(filePath, outputPath) {
    const stats = fs.statSync(filePath)
    const rematchLastUpdatedTime = stats.mtime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })

    fs.writeFileSync(outputPath, `${rematchLastUpdatedTime}`, 'utf-8')
}

/**
 * @brief 生成下一周的 BOSS 名单。
 * @param {string} bossListJsonPath 总 BOSS 名单的 JSON 路径。
 * @param {string} weekListJsonPath 每周 BOSS 名单的 JSON 路径。
 */
export function generateRematchBossNextWeek(bossListJsonPath, weekListJsonPath) {
    const bossList = JSON.parse(fs.readFileSync(bossListJsonPath, 'utf8'))
    const weekList = JSON.parse(fs.readFileSync(weekListJsonPath, 'utf8'))

    const lastWeekList = weekList[weekList.length - 1]

    // 上一周的 BOSS 名单。
    const lastWeekBoss = new Set(
        Object.keys(lastWeekList).filter(k => k !== 'week')
    )

    // 排除上一周的 BOSS。
    const candidates = bossList.filter(b => !lastWeekBoss.has(b.name))

    if (candidates.length < 8) {
        throw new Error('可选 BOSS 不足 8 个')
    }

    // 洗牌出 8 个 BOSS。
    const shuffled = candidates.sort(() => Math.random() - 0.5)

    const selected = shuffled.slice(0, 8)

    const newWeekList = {
        week: lastWeekList.week + 1
    }

    for (const boss of selected) {
        newWeekList[boss.name] = boss.url
    }

    weekList.push(newWeekList)

    fs.writeFileSync(
        weekListJsonPath,
        JSON.stringify(weekList, null, 4),
        'utf8'
    )
}

/**
 * @brief 生成复战每周 BOSS 名单 Markdown 文件（按周次倒序）。
 * @param {String} weekListJsonPath 每周 BOSS 名单的 JSON 路径。
 * @param {String} outputMdPath 输出 Markdown 文件路径。
 * @param {String} startDate 起始日期。
 * @param {string} pageHeader 页面开头显示的文字。
 * @param {string} pageFooter 页面结尾显示的文字。
 */
export function generateRematchWeekBossList(weekListJsonPath, outputMdPath, startDate, pageHeader = '', pageFooter = '') {
    const weekList = JSON.parse(fs.readFileSync(weekListJsonPath, 'utf8'))

    const rows = []

    for (const week of weekList) {

        // weekIndex 用于计算当前周相对第一周的偏移。例如：Week1 = 0, Week2 = 1, Week3 = 2。
        const weekIndex = week.week - 1

        // 计算本周开始日期。
        const start = new Date(startDate)
        start.setDate(start.getDate() + weekIndex * 7)

        // 结束日期 = 开始日期 + 6 天。
        const end = new Date(start)
        end.setDate(end.getDate() + 6)

        // 日期格式化为 YYYY-MM-DD。
        const format = d => d.toISOString().slice(0, 10)

        // 存储当前周的 BOSS 列表。
        const bossList = []

        for (const [name, url] of Object.entries(week)) {
            // 跳过 week 字段（它不是 BOSS）。
            if ('week' === name) continue

            bossList.push(`[${name}](${url})`)
        }

        // 构建表格的一行。周次，日期区间，BOSS 名单。
        rows.push([
            week.week,
            `${format(start)} ~ ${format(end)}`,
            bossList.join('、')
        ])
    }

    // 按周次倒序排序（Week 2 在 Week 1 前面）。
    rows.sort((a, b) => b[0] - a[0])

    const mdData = [{
        table: {
            headers: ['周', '日期', 'Boss 名单'],
            rows
        }
    }]

    let content = pageHeader
    content += json2md(mdData)
    content += pageFooter

    fs.writeFileSync(outputMdPath, content, 'utf8')
}

/**
 * @brief 解析复战每章的成绩表格，生成 JSON 数据。
 * @param filePath Excel 文件路径。
 * @param sheetIndex 工作表索引。
 * @param outputJsonPath 输出的 Json 文件路径。
 * @return 返回复战每章的成绩表格 JSON。
 */
export function generateRematchJsonEachChapter(filePath, sheetIndex, outputJsonPath) {
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[sheetIndex]
    const sheet = workbook.Sheets[sheetName]

    const range = XLSX.utils.decode_range(sheet["!ref"])

    // 按赛道存储结果。
    const result = {
        单禁字赛道: {},
        无限制赛道: {}
    }

    const bossList = []

    // 第 2 行为 BOSS 名，每个 BOSS 占 3 列：玩家 | 成绩 | mod。
    for (let c = range.s.c; c <= range.e.c; c += 3) {
        const cell = sheet[XLSX.utils.encode_cell({ r: 1, c })]

        if (!cell || !cell.v) continue

        const boss = String(cell.v).trim()

        bossList.push({
            name: boss,
            col: c
        })

        result["单禁字赛道"][boss] = []
        result["无限制赛道"][boss] = []
    }

    let mode = "单禁字赛道"

    // 从第 3 行开始遍历选手数据。
    for (let r = 2; r <= range.e.r; r++) {
        const firstCell = sheet[XLSX.utils.encode_cell({ r, c: 0 })]

        // 识别赛道切换或底部说明区。
        if (firstCell && firstCell.v) {
            const text = String(firstCell.v)

            // 切换到无限制赛道。
            if (text.includes("无限制赛道")) {
                mode = "无限制赛道"
                continue
            }

            // 遇到说明区直接结束。
            if (text.includes("暂时只记录抖音和b站有视频的成绩")) { break }
        }

        // 逐个 BOSS 读取对应列的数据。
        for (const boss of bossList) {
            const nameCell = sheet[XLSX.utils.encode_cell({ r, c: boss.col })]
            const scoreCell = sheet[XLSX.utils.encode_cell({ r, c: boss.col + 1 })]
            const modCell = sheet[XLSX.utils.encode_cell({ r, c: boss.col + 2 })]

            if (!nameCell || nameCell.v == null) continue

            const name = String(nameCell.v).trim()

            // 读取成绩与视频链接。
            const score = scoreCell ? String(scoreCell.v).trim() : ""
            const link = scoreCell?.l?.Target || ""

            const mod = modCell ? String(modCell.v).trim() : ""

            result[mode][boss.name].push({
                选手: name,
                成绩: link ? [score, link] : [score],
                mod: mod
            })
        }
    }

    fs.writeFileSync(outputJsonPath, JSON.stringify(result, null, 4), "utf-8")
}

/**
 * @brief 转换复战每一章的数据。
 * @param {string} inputJsonPath 原始 JSON 文件路径。
 * @returns {string}
 */
export function convertEachChapter(inputJsonPath) {
    const data = JSON.parse(fs.readFileSync(inputJsonPath, "utf-8"))

    const md = []

    const bosses = Object.keys(data["单禁字赛道"])

    for (const boss of bosses) {

        // Boss 标题。
        md.push({ h3: boss })

        for (const mode of ["单禁字赛道", "无限制赛道"]) {

            // 赛道名称（普通文本）。
            md.push(mode + '\n')

            const rows = data[mode][boss]

            const table = {
                headers: ["排名", "选手", "成绩", "mod"],
                rows: []
            }

            rows.forEach((item, index) => {

                const score = item.成绩.length === 2
                    ? `[${item.成绩[0]}](${item.成绩[1]})`
                    : item.成绩[0]

                table.rows.push([
                    index + 1,
                    item.选手,
                    score,
                    item.mod
                ])
            })

            md.push({ table })
        }
    }


    return json2md(md)
}

/**
 * @brief 生成复战 BOSS 成绩榜单 Markdown 文件。
 * @param {string} eachChapterJsonPrefix 每章节榜单 JSON 原文件路径前缀。
 * @param {string} outputMdPath 输出的 Markdown 文件路径。
 * @param {string} pageHeader 页面开头显示的文字。
 * @param {string} pageFooter 页面结尾显示的文字。
 */
export function generateRematchLeaderboard(eachChapterJsonPrefix, outputMdPath, pageHeader = '', pageFooter = '') {
    let content = pageHeader

    const cn = ["一", "二", "三", "四", "五", "六"]

    for (let i = 1; i <= 6; ++i) {
        // 每章前加第几章。
        content += `## 第${cn[i - 1]}章\n\n`

        content += convertEachChapter(eachChapterJsonPrefix + `${i}.json`)
    }
    content += pageFooter
    fs.writeFileSync(outputMdPath, content, 'utf-8')
}
