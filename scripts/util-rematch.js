import fs from 'fs'
import json2md from 'json2md'


/**
 * 生成下一周的 BOSS 名单。
 * @param {string} bossListJsonPath 总 BOSS 名单的 JSON 路径。
 * @param {string} weekListJsonPath 每周 BOSS 名单的 JSON 路径。
 */
export function generateRematchJsonNextWeek(bossListJsonPath, weekListJsonPath) {
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

    // 洗牌。
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
 * 生成复战每周 BOSS 名单 Markdown 文件。
 * @param {String} weekListJsonPath 每周 BOSS 名单的 JSON 路径。
 * @param {String} outputMdPath 输出 Markdown 文件路径。
 * @param {String} startDate 起始日期。
 * @param {string} pageHeader 页面开头显示的文字。
 * @param {string} pageFooter 页面结尾显示的文字。
 */
export function generateRematchWeekList(weekListJsonPath, outputMdPath, startDate, pageHeader = '', pageFooter = '') {
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

    // 构造 json2md 需要的数据结构。
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
