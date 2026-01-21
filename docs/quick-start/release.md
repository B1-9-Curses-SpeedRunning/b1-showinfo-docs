# 版本发布日志

> 以下所有资源的链接均为蓝奏云盘的分享链接。若想直链下载，可以科学上网去我的 Github 仓库的 [Release](https://github.com/B1-9Ban-BossRush/b1-showinfo-docs/releases) 进行下载。别问为什么没有 Gitee，这玩意狗都不用。

## ShowInfo

本 MOD 的压缩包中整合了 MOD 加载器 CSharpLoader 和 MOD 本体。

为方便查找和下载，这里的版本管理采用时间线倒序，将最新的版本放在前面，后续更新稳定 stable 版本以后会单独说明。

### v2.0-LZ-1stAnniv-dev.10.1

为迎合一周年连战活动制作的特殊版本。

下载链接如下：[v2.0-LZ-1stAnniv-dev.10.1](https://lzx0626.lanzouq.com/id6ld3gpau0f)

发布日志如下：

1. 整合了云轩大佬的 BossRush V4，解压放到相应目录即可同时使用自定义连战和关键数据显示功能。
2. 由于 BossRush V4 和风灵月影矛盾，因此实现了部分连战中经常需要用到得当功能作为风灵平替： 
   - 游戏中按下 F5 可以加速，再次按下恢复 1 倍速，由于不能像风灵月影那样有提示音（作者时间有限），因此在连战进入三二一倒数的时候会强制恢复 1 倍速。
   - Ctrl+F1 可以设置攻击力，指定数值请编辑 _atkBase_xxx 文件名；
   - Ctrl+F2 设置无限生命，_infHP_1 为开启，_infHP_0 为关闭；
   - Ctrl+F10 设置最大血量用于模拟半血出发夜叉头，对应文件 _maxHP_xxx；
   - Ctrl+F11 为设置棍势，对应文件 _gunshi_xxx；
   - Ctrl+F12 为设置四灾寒、火、毒、雷抗性，对应文件 _szXXX_xxx。
> 重要事项: 除棍势为一次性设置以外，其他都为常驻，需要编辑数值后再按下快捷键才可覆盖，其中 1_infHP_ 用 0,1 表示关闭和开启，其余都用 -1 表示关闭。每次修改完文件名后都需要按下对应快捷键保证生效。需要注意的是修改完成后还需刷新猴子以完成应用，如重新去打连战，或者去个新土地庙。
3. 为了连战周年纪念赛修改了自定义连战中部分 boss 的血量，其中纪念赛老 boss 组（不净、毒蛙、寅虎、黑手道人、石猿、法相、虎先锋）血量和官方连战保持一致，新 Boss 组（黑风、石先锋、莲眼、石蛙、赤尻马猴、璧水金晶兽）血量全部改为接近入圣难度的复战 boss 血量。

对应文件如下：

<center><img src="https://cdn.davidingplus.cn/images/2025/12/25/500d2c85104380208186f7bafeff9e77.png" alt="500d2c85104380208186f7bafeff9e77" style="zoom:70%;" /></center>


### v2.0-dev.x

在 v1.1-dev.x 版本基础上，增加了如下功能：

1. 新的 BOSS 血量实现，提升效率降低资源使用，全部复战、主线血条均可显示数值。

v2.0-dev.x 已经实现基础数据展示、血量显示、计时器、结算页显示细节，之后预计不会做新功能了，只会修 BUG 和闪退，等到没啥问题就直接出 v2.0 稳定版。

下载链接如下：

- [v2.0-dev.8](https://lzx0626.lanzouq.com/iSpIl3bbi5mb)：结算页恢复老版本的实现方法以改善老版本闪退、卡顿、死机等问题（新版本无法正常显示结算页，建议新版继续用 dev.7）。同时计时器实现方式简化以降低闪退概率。

- [v2.0-dev.7](https://lzx0626.lanzouq.com/it06z38tuvhe)

- [v2.0-dev.6](https://lzx0626.lanzouq.com/ieTUg37qpene)

- [v2.0-dev.5](https://lzx0626.lanzouq.com/impJV37f68ni)

- [v2.0-dev.2](https://lzx0626.lanzouq.com/i6hXI373yc4j)

- [v2.0-dev.1](https://lzx0626.lanzouq.com/iPzqX372nxba)

### v1.1-dev.x

在 v1.0 版本基础上，增加了如下功能：

1. 增加了计时器，可以看到截止目前和每个 BOSS 的用时。
2. 增加了 BOSS 的血量显示。
3. 增加了击败每个 BOSS 的爆伤和截至目前的爆伤。
4. 在结算界面增加显示了耗时和爆伤明细。
5. 更换官方字体，更加美观。
6. 增加了法力、气力相关数据。
7. 兼容主线速通需求。

下载链接如下：

- [v1.1-dev.12](https://lzx0626.lanzouq.com/iH1s736y3zeb)：第一，修复三二一出战不显示计时器的 BUG。第二，尝试降低闪退率。

- [v1.1-dev.11](https://lzx0626.lanzouq.com/ipOen36opu6f)：第一，尝试降低闪退率。第二，修改文字间隔。

- [v1.1-dev.10](https://lzx0626.lanzouq.com/irULC36lmukd)：第一，改了代码结构，尝试降低闪退率。第二，更换官方字体，更加美观。第三，增加了法力、气力相关数据。第四，兼容主线速通需求。

- [v1.1-dev.9](https://lzx0626.lanzouq.com/iHTbl36adycj)：连战成功、连战失败、试演成功、失败菜单界面都能显示耗时和暴伤明细。同时修改计时器 bug。

- [v1.1-dev.8](https://lzx0626.lanzouq.com/ilvNF368xjrc)：增加了击败每个 BOSS 的爆伤和截至目前的爆伤。

- [v1.1-dev.7](https://lzx0626.lanzouq.com/iCVYt363uxzg)

- [v1.1-dev.6](https://lzx0626.lanzouq.com/i2gux363uxwd)：修改计时器的 bug，增加了 BOSS 的血量显示。

- [v1.1-dev.5](https://lzx0626.lanzouq.com/i3ZcM35xl6wb)：修复重新挑战不清空计时历史的问题。

- [v1.1-dev.4](https://lzx0626.lanzouq.com/iOdJ535vqdva)：增加了每个 BOSS 的用时。

- [v1.1-dev.3](https://lzx0626.lanzouq.com/iTV1i35ugrjg)：优化了一下计时器，倒数 3 2 1 的时候会显示。

- [v1.1-dev.2](https://lzx0626.lanzouq.com/iiQhE35s2adc)

### v1.0（正式版本）

最终发布的正式版本 v1.0。同时也伴随着新榜单规则的制定完善和新榜单记录的开始。

下载链接：[v1.0](https://lzx0626.lanzouq.com/iWkYQ34uuhsd)

### v0.1-dev.x

在 v0.0 版本基础上，优化修改了游戏崩溃的问题，为了避免版本冗杂，因此放在一个 release 中，部分版本的特殊改动会具体说明。

下载链接如下：

- [v0.1-dev.8](https://lzx0626.lanzouq.com/il7zW34rylmh)

- [v0.1-dev.7](https://lzx0626.lanzouq.com/io07d34o37kh)：目前测试来看，这个版本稳定的一比，本人鏖战 4 小时 15 分钟，最终体力不支败下阵来。

- [v0.1-dev.6](https://lzx0626.lanzouq.com/iAUEw34o37he)

- [v0.1-dev.5](https://lzx0626.lanzouq.com/iomaR34o37fc)：宋笛大佬为了针对性地查找 Bug，增加了一个终端输出信息。

- [v0.1-dev.4](https://lzx0626.lanzouq.com/i4aMM34o37eb)

- [v0.1-dev.3](https://lzx0626.lanzouq.com/ikIV834o37da)

- [v0.1-dev.2](https://lzx0626.lanzouq.com/iVghs34o37bi)

- [v0.1-dev.1](https://lzx0626.lanzouq.com/i3TyW34o377e)

- [v0.1-dev](https://lzx0626.lanzouq.com/i1PU334o37li)

### v0.0

最初发布的测试版本。

下载链接：[v0.0](https://lzx0626.lanzouq.com/ihh1S34o375c)

## CSharpLoader

黑神话悟空 MOD 的 CSharp 加载器，原项目地址：[B1CSharpLoader](https://github.com/czastack/B1CSharpLoader)。

