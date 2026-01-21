/**
 * @file generate-list-data.js
 * @author DavidingPlus (davidingplus@qq.com)
 * @brief 生成榜单页面的主程序入口文件。
 * 
 * Copyright (c) 2025 DavidingPlus
 * 
 */
import { generateJsonSingle, generateJsonTotal, generateOfficialRankingList, generateJsonFirstAnniversary, generateFirstAnniversaryRankingList, generateLastUpdatedTime } from "./util.js"
import fs from 'fs'


console.log("now running command: npm/pnpm run " + process.env.npm_lifecycle_event)
if ("dev" === process.env.npm_lifecycle_event || "generate-list" === process.env.npm_lifecycle_event) {
    generateLastUpdatedTime("data/黑猴九禁速通榜(新).xlsx", "data/last-updated-time")

    generateJsonSingle("data/黑猴九禁速通榜(新).xlsx", 1, "data/new-list-single.json")

    generateJsonTotal("data/黑猴九禁速通榜(新).xlsx", 2, "data/new-list-total.json")

    generateJsonFirstAnniversary("data/黑猴九禁速通榜(新).xlsx", 3, "data/first-anniversary.json")
}


const lastUpdatedTime = fs.readFileSync('data/last-updated-time', 'utf-8').trim()

generateOfficialRankingList(
    'data/new-list-single.json',
    'data/new-list-total.json',
    'docs/ranking-list/new-list.md',
    `# 新榜单\n\n本页面展示的榜单完全来源于原腾讯文档中的内容。若更新不及时请优先参考[原文档](https://docs.qq.com/sheet/DTUhETnNCQ0RoRm9v)。\n\n> 榜单最后更新于：${lastUpdatedTime}\n\n`
)

generateFirstAnniversaryRankingList(
    'data/first-anniversary.json',
    'docs/ranking-list/first-anniversary.md',
    `# 一周年活动连战榜单\n\n本页面展示的榜单完全来源于原腾讯文档中的内容。若更新不及时请优先参考[原文档](https://docs.qq.com/sheet/DTUhETnNCQ0RoRm9v?tab=000004)。\n\n> 榜单最后更新于：${lastUpdatedTime}\n\n`,
    `\n## 特别祝贺

1. [山月为关](https://space.bilibili.com/3493117797861490/)选手道满归根记录 [4'04''79](https://www.bilibili.com/video/BV1RLiPBsEM4/) 从 2025 年 12 月 30 日保持 10 天至 2026 年 1 月 9 日，获得影之刃零豪华版一份。

2. [阿班](https://space.bilibili.com/511651162/)选手道满归根记录 [3'58''72](https://www.bilibili.com/video/BV1qtrsBvEdP/) 从 2026 年 1 月 10 日保持 10 天至 2025 年 1 月 20 日，获得影之刃零豪华版一份。\n\n`
)

generateOfficialRankingList(
    'data/old-list-single.json',
    'data/old-list-total.json',
    'docs/ranking-list/old-list.md',
    `# 旧榜单\n\n本页面展示的榜单完全来源于原腾讯文档中的内容。由于已停更，仅展示前十名，[原文档](https://docs.qq.com/sheet/DTXNnc09DRGZWVGxt)。\n\n`
)
