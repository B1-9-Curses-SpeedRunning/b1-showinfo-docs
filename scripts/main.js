/**
 * @file main.js
 * @author DavidingPlus (davidingplus@qq.com)
 * @brief 项目数据构建入口，负责分发 Excel 解析与 Markdown 生成任务。
 *
 * Copyright (c) 2025 DavidingPlus
 *
 */
import fs from 'fs'
import { generateGauntletJsonSingle, generateGauntletJsonOverall, generateGauntletOfficialLeaderboard, generateGauntletJsonFirstAnniversary, generateGauntletFirstAnniversaryLeaderboard, generateGauntletLastUpdatedTime } from './util-gauntlet.js'
import { generateRematchBossNextWeek, generateRematchWeekBossList, generateRematchJsonEachChapter, generateRematchLastUpdatedTime, generateRematchLeaderboard } from './util-rematch.js'


console.log('now running command: npm/pnpm run ' + process.env.npm_lifecycle_event)

/**
 * @brief 根据 package.json 中触发的脚本名称分发本次执行逻辑。
 * @details
 * 当前入口同时被 generate-data、generate-week-boss-list、dev、build 等脚本复用，
 * 因此通过 npm_lifecycle_event 判断本次需要执行的是“更新原始数据”还是“仅重建文档页面”。
 */
if ('generate-week-boss-list' === process.env.npm_lifecycle_event) {
    generateRematchBossNextWeek('data/rematch/boss-list.json', 'data/rematch/week-boss-list.json')
}
else {
    if ('generate-data' === process.env.npm_lifecycle_event) {
        // 连战。

        // generateGauntletLastUpdatedTime('data/gauntlet/黑猴九禁速通榜(新).xlsx', 'data/gauntlet/last-updated-time')

        generateGauntletJsonSingle('data/gauntlet/黑猴九禁速通榜(新).xlsx', 1, 'data/gauntlet/new-single.json')

        generateGauntletJsonOverall('data/gauntlet/黑猴九禁速通榜(新).xlsx', 2, 'data/gauntlet/new-overall.json')

        generateGauntletJsonFirstAnniversary('data/gauntlet/黑猴九禁速通榜(新).xlsx', 4, 'data/gauntlet/first-anniversary.json')


        // 复战。

        // generateRematchLastUpdatedTime('data/rematch/黑猴复战齐天速通榜.xlsx', 'data/rematch/last-updated-time')

        for (let i = 1; i <= 6; ++i) {
            generateRematchJsonEachChapter('data/rematch/黑猴复战齐天速通榜.xlsx', i, `data/rematch/chapter-${i}.json`)
        }
    }


    // const gauntletLastUpdatedTime = fs.readFileSync('data/gauntlet/last-updated-time', 'utf-8').trim()
    // const rematchLastUpdatedTime = fs.readFileSync('data/rematch/last-updated-time', 'utf-8').trim()


    // 连战。
    generateGauntletOfficialLeaderboard(
        'data/gauntlet/new-single.json',
        'data/gauntlet/new-overall.json',
        'docs/leaderboard/gauntlet/new.md',
        `# 九禁连战新榜单\n\n本页面展示的榜单完全来源于原腾讯文档中的内容。榜单目前已实现每日自动同步[原文档](https://docs.qq.com/sheet/DTUhETnNCQ0RoRm9v?tab=000002)数据，若数据同步不及时或出现其他问题请联系[网站作者](https://davidingplus.cn)。\n\n`
    )

    generateGauntletFirstAnniversaryLeaderboard(
        'data/gauntlet/first-anniversary.json',
        'docs/leaderboard/gauntlet/first-anniversary.md',
        `# 一周年活动连战榜单\n\n本页面展示的榜单完全来源于原腾讯文档中的内容。榜单目前已实现每日自动同步[原文档](https://docs.qq.com/sheet/DTUhETnNCQ0RoRm9v?tab=000004)数据，若数据同步不及时或出现其他问题请联系[网站作者](https://davidingplus.cn)。\n\n`,
        `\n## 特别祝贺

1. [山月为关](https://space.bilibili.com/3493117797861490/)选手道满归根记录 [4'04''79](https://www.bilibili.com/video/BV1RLiPBsEM4/) 从 2025 年 12 月 30 日保持 10 天至 2026 年 1 月 9 日，获得影之刃零豪华版一份。

2. [阿班](https://space.bilibili.com/511651162/)选手道满归根记录 [3'58''72](https://www.bilibili.com/video/BV1qtrsBvEdP/) 从 2026 年 1 月 10 日保持 10 天至 2026 年 1 月 20 日，获得影之刃零豪华版一份。

3. [辣舞77777](https://space.bilibili.com/290027032/)选手群妖聚义记录 [2'07''26](https://www.bilibili.com/video/BV1qtrsBvEdP/) 从 2026 年 3 月 5 日保持 10 天至 2026 年 3 月 15 日，获得影之刃零豪华版一份。\n\n`
    )

    generateGauntletOfficialLeaderboard(
        'data/gauntlet/old-single.json',
        'data/gauntlet/old-overall.json',
        'docs/leaderboard/gauntlet/old.md',
        `# 九禁连战旧榜单\n\n本页面展示的榜单完全来源于原腾讯文档中的内容。由于已停更，仅展示前十名，[原文档](https://docs.qq.com/sheet/DTXNnc09DRGZWVGxt)。\n\n`
    )


    // 复战。
    generateRematchWeekBossList('data/rematch/week-boss-list.json', 'docs/leaderboard/rematch/week-boss-list.md', '2026-03-09', `# 复战齐天每周 BOSS 名单\n\n`)

    generateRematchLeaderboard(
        'data/rematch/chapter-',
        'docs/leaderboard/rematch/leaderboard.md',
        `# 复战齐天速通榜单\n\n本页面展示的榜单完全来源于原腾讯文档中的内容。榜单目前已实现每日自动同步[原文档](https://docs.qq.com/sheet/DSnhYRENVZmNCQk9i)数据，若数据同步不及时或出现其他问题请联系[网站作者](https://davidingplus.cn)。\n\n`
    )
}
