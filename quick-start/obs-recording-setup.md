---
url: /quick-start/obs-recording-setup.md
---
# OBS 录制环境搭建教程

新榜单规则中提到：

> 使用 OBS 进行游戏视频录制，游戏界面配置榜单管理组指定的全键盘键鼠以及手柄映射（手柄选手）。
>
> * 键盘选手只需展示键鼠映射。
> * 手柄玩家必须展示手柄映射和键鼠映射（以防止游戏过程中利用键盘快捷键使用外挂工具），连战完成后，利用键盘敲击此次连战暴伤数字并确保此过程被视频纪录（例如暴伤为 57.5%，依次敲击 5、7、5。此行为了确保键盘映射真实有效）。

因此，本文就规则涉及到的 OBS 录制环境的搭建，提供一个简单的方案。

## 安装 OBS

OBS，全称 OBS Studio，是一款功能强大的开源软件，它使用户能够直接从电脑录制视频和直播内容到 Twitch，YouTube 和 Facebook Live 等平台。它在需要直播或录制屏幕活动的游戏玩家、YouTube 用户和专业人士中特别受欢迎。OBS Studio 允许创建由多个源组成的复杂场景，包括网络摄像头源、屏幕截图和音频输入，这些场景可以在直播期间无缝切换。凭借先进的混音功能、可自定义的视频质量和性能设置以及对各种插件和扩展的支持，OBS Studio 为高质量视频制作和直播提供了多功能且用户友好的解决方案。

简单来讲，OBS 允许你录制视频和直播内容，同时可以自定义想要展示到屏幕上的内容，好用爱用。

安装 OBS，我这里给出两种方案。

1. 官网下载（最推荐）

点击[此链接](https://obsproject.com/download)进行官网下载页面，找到最新版本进行下载。推荐安装 Installer，全自动流程。

![image-20250830111911403](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830111911403.png)

2. Steam 下载

OBS 能在 Steam 商店中找到，直接下载即可。

![image-20250830112049331](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830112049331.png)

注意，通过 Steam 下载的 OBS，当切换账号以后，需要关闭 OBS，重新打开才能正常使用。对于有直播需求并且需要频繁切号的朋友非常不方便。一个比较好的解决思路是进入 OBS 的安装目录，创建入口程序 `obs64.exe` 的快捷方式，后续直接通过快捷方式打开即可。这样就绕过了 Steam 的检测环节。

![image-20250830112335953](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830112335953.png)

另外：

> 本来想放一份安装包到蓝奏云上的，但是蓝奏云免费版文件最大大小 100 MIB，安装包都 150 MIB 了。所以大家还是用前两种办法下载吧。
>
> 🐶🐶🐶狗头保命🐶🐶🐶

## 基本配置

在打开 OBS 之前，请先设置一下桌面的快捷方式的属性，右键快捷方式，选择属性，选择兼容性，勾选上以管理员模式启动。避免运行过程中 OBS 缺少管理员权限导致无法正常录制或直播。

打开 OBS 以后，你的界面大概是这样的：

![image-20250830113501507](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830113501507.png)

下面的源默认是空的，我们需要在里面添加能捕捉到显示屏的内容。录制黑猴一般只用得到显示器采集和游戏采集。

关于显示器采集，采集方式默认自动即可，显示器选择你自己的显示器就行，这样 OBS 就能正常抓取到你的屏幕了。

![image-20250830123514878](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830123514878.png)

关于游戏采集，模式可以选择采集全屏应用程序或者采集特定窗口。

采集全屏应用程序，其他的默认即可。

![image-20250830123934789](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830123934789.png)

采集特定窗口，在窗口中选择黑猴的程序 `b1-Win64-Shipping.exe`，其他的依旧默认即可。

![image-20250830124103529](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830124103529.png)

## 录制视频

上述的基本配置做好以后，点击开始录制就可以录制视频了。不过在录制视频以前建议先对录制的视频进行一些设置。以下会我自己使用的一些设置，大家可以根据这个进行调整成自己喜欢的样子。

在视频栏，帧率建议选择 `59.94` 或者 `60`。

![image-20250830124648702](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830124648702.png)

在输出栏，输出模式建议选择高级，以下会给我我自己的直播和录制的设置。

直播的设置如下，没有直播需求的朋友直接看录制设置即可。有直播需求的朋友可以结合我这个和网上其他大佬的设置综合调整。

![image-20250830124912787](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830124912787.png)

录制的录制设置如下，注意修改录像路径到自己指定的位置，防止不知道什么时候 C 盘炸了。

![image-20250830125031474](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830125031474.png)

录制的编码器设置如下，比特率控制建议选 CBR，比特率 8000 到 10000 即可。

![image-20250830125146633](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830125146633.png)

这样设置好以后，就可以开始录制了。更进一步还可以设置快捷键方便开始录制和停止录制。

## 键鼠映射

键鼠映射需要用到一个 OBS 插件 [Input Overlay](https://obsproject.com/forum/resources/input-overlay.552/)，它能在直播中显示键盘、鼠标和手柄的输入情况。它会新增一个来源，用于可视化输入。

这个插件通过纹理（texture）和配置文件来生成覆盖层。这意味着你可以自行配置在屏幕上显示哪些按键、它们的排列方式以及外观。默认情况下，插件已经自带了鼠标、键盘和手柄的预设文件。这些预设文件位于 GitHub Release 页面中的 `presets` 压缩包内。在 OBS 中创建一个 “Input Overlay” 来源时，你可以将其指向这些预设文件，或者指向你自己制作的配置文件。

原下载链接在外网 [Github](https://github.com/univrsal/input-overlay) 上，有兴趣的朋友可以科学上网自己去下载最新版本。这里在蓝奏云上备份了 input-overlay v5.0.6。

下载链接：

* [input-overlay-5.0.6-windows-x64.zip](https://lzx0626.lanzouq.com/iU8hy34xgfeb)
* [input-overlay-5.0.6-presets.zip](https://lzx0626.lanzouq.com/iVDRY34xgf0h)

下载好以后，首先解压 input-overlay-5.0.6-windows-x64.zip，得到的文件类似如下：

![image-20250830131510053](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830131510053.png)

将这些目录全部拷贝你自己的到 OBS 的安装根目录下，例如我的目录就是 `D:\Scoop\apps\obs-studio\current`，OBS 根目录类似如下：

![image-20250830131618256](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830131618256.png)

完事以后重新打开 OBS，在添加源里面就会发现多了一个**输入叠加**的选项。这个就是添加键鼠映射的入口。

以键盘映射为例，点击输入叠加，会让你选择贴图文件和配置文件。这些东西在上文提到的另一个文件 input-overlay-5.0.6-presets.zip 中，官方给了我们一些预设，直接拿来使用即可。将该文件解压出来以后，放到你自己找得到的位置（不一定是 OBS 的安装根目录）即可。

![image-20250830131917080](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830131917080.png)

由于规则要求键盘映射需要全尺寸键盘，因此键盘的贴图文件推荐使用 `qwertz_full_size_german`。以下以 input-overlay-5.0.6-presets 目录为基准，给出了贴图文件和配置文件的路径。

```markdown
 贴图文件：input-overlay-5.0.6-presets/qwertz_full_size_german/qwertz_full_size_german.png
 配置文件：input-overlay-5.0.6-presets/qwertz_full_size_german/qwertz_full_size_german.json
```

添加好以后，你就能在 OBS 中看到键盘映射了。至于在 OBS 的屏幕上放在哪，有多大，这个就读者自行去探索吧。

另外，附上我自己使用的鼠标映射：

```markdown
贴图文件：input-overlay-5.0.6-presets/mouse/mouse.png
配置文件：input-overlay-5.0.6-presets/mouse/mouse-arrow.json
```

## 手柄映射

手柄映射有两种方式，一种是和上文键鼠映射的方式一样，添加一个手柄的贴图和 json 文件，另一种是通过浏览器 URL 采集实现。

第一种方式，同上文给出我自己推荐的手柄映射配置：

```markdown
贴图文件：input-overlay-5.0.6-presets/gamepad/game-pad.png
配置文件：input-overlay-5.0.6-presets/gamepad/game-pad.json
```

第二种方式，通过浏览器 URL 采集实现。首先给出一个在线链接 [Gamepad Viewer](https://ezgame.cc/tools/gamepadviewer.com/)。这是一个在线网站，可以让你根据自己的喜好设置手柄映射，然后返回给你一个 URL，这个 URL 能被 OBS 的浏览器源识别并展示出来。

这里给我我自己的手柄映射 URL：

```markdown
https://ezgame.cc/tools/gamepadviewer.com/?p=1&s=0
```

![image-20250830133003743](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830133003743.png)

## 帧率显示

帧率显示有很多办法，我知道就有微信小飞机，Steam 自带的帧数显示，部分厂商例如联想自带的帧数显示，游戏加加等。

读者选择自己喜欢的就行，这里不再赘述。

## 最终效果

最终录制出来的效果大致如下：

![image-20250830133603428](https://cdn.davidingplus.cn/images/2025/08/30/image-20250830133603428.png)

（后面部分暂时没时间写，先这样吧，反正暂时不影响大家伙凹成绩。）

## 回放缓存

待补。

## 使用 OBS 直播

待补。

## 参考文档

待补。
