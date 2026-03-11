import fs from 'fs'
import json2md from 'json2md'


/**
 * 生成下一周的 BOSS 名单。
 * @param {string} bossListJsonPath 总 BOSS 名单的 JSON 路径。
 * @param {string} weekListJsonPath 每周 BOSS 名单的 JSON 路径。
 */
export function generateRematchJsonNextWeek(bossListJsonPath, weekListJsonPath) {
    const bossList = JSON.parse(fs.readFileSync(bossListJsonPath, "utf8"))
    const weekList = JSON.parse(fs.readFileSync(weekListJsonPath, "utf8"))

    const lastWeekList = weekList[weekList.length - 1]

    // 上一周的 BOSS 名单。
    const lastWeekBoss = new Set(
        Object.keys(lastWeekList).filter(k => k !== "week")
    )

    // 排除上一周的 BOSS。
    const candidates = bossList.filter(b => !lastWeekBoss.has(b.name))

    if (candidates.length < 8) {
        throw new Error("可选 BOSS 不足 8 个")
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
        "utf8"
    )
}

/**
 * 生成复战每周 BOSS 名单 Markdown 文件。
 * @param {String} weekListJsonPath 每周 BOSS 名单的 JSON 路径。
 * @param {String} outputMdPath 输出 Markdown 文件路径。
 * @param {string} pageHeader 页面开头显示的文字。
 * @param {string} pageFooter 页面结尾显示的文字。
 */
export function generateRematchWeekList(weekListJsonPath, outputMdPath, pageHeader = '', pageFooter = '') {
    const weekList = JSON.parse(fs.readFileSync(weekListJsonPath, "utf8"))

    const mdData = []

    for (const week of weekList) {
        const weekNum = week.week

        mdData.push({ h2: `Week ${weekNum}` })

        const list = []

        for (const [name, url] of Object.entries(week)) {
            if (name === "week") continue

            list.push(`[${name}](${url})`)
        }

        mdData.push({
            ul: list
        })
    }

    let content = pageHeader
    content += json2md(mdData)
    content += pageFooter

    fs.writeFileSync(outputMdPath, content, "utf8")
}
