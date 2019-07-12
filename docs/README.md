# 相关技术介绍

实现点击桌面图标就可以直接打开 NOMO 的指定相机，通过的是 iOS 上的 WEB APP 这个途径。

## 概览

我们添加到主屏幕的图标也就是启动 WEB APP 的图标，而 WEB APP 本质上就是一个添加了相应 Apple 私有属性的普通网页，可以跟原生 iOS APP 的表现相似（比如全屏幕运行而不显示浏览器的 UI）。



在 Safari 中，任何网页都可以添加到主屏幕，但二者的表现有些不同。下面是对比表格（暂时不涉及 PWA ）：

|            |       普通网页       |                 WEB APP                 |
| :--------: | :------------------: | :-------------------------------------: |
|  桌面图标  |      网页的截图      |         通过私有属性设置的图标          |
|  图标名称  |   默认为网页 Title   |  默认为网页 Title，可通过私有属性设置   |
|  点击表现  | 跳转到 Safari 中打开 | 可设置不显示 Safari UI，与 APP 表现相同 |
|   启动图   |          无          |        通过私有属性设置的启动图         |
| 状态栏颜色 |          /           |            通过私有属性设置             |



⚠️  上面说的点击表现指的是添加到主屏幕后，点击桌面上的图标的表现。而 WEB APP 既然是一个网页，也可以在 Safari 中输入网址打开，这时它的表现跟普通网页是一样的。



所以思路就有了，我们根据 WEB APP 的两种不同状态分别执行不同的动作：

- 当在 Safari 中打开时，显示引导用户添加到主屏幕的提示性 UI
- 当点击桌面图标打开时，跳转到 NOMO 指定相机的 URL SCHEME



而这两种状态，JavaScript 的 BOM 对象也提供了相应的 API 来判断，即 `window.navigator.standalone` ，若为 `true` ，则为点击桌面图标打开。



**所以，将某一个相机添加到桌面，只需生成对应该相机的 WEB APP 页面，在 Safari 中打开并引导它添加到户屏幕就可以。**



这个 WEB APP 的 HTML 最简化代码如下，下文逐句解读：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>NOMO 相机名称</title>
    <meta content="yes" name="apple-touch-fullscreen">
    <meta content="yes" name="apple-mobile-web-app-capable">
    <meta content="black" name="apple-mobile-web-app-status-bar-style">
        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" href="https://p1.cug123.com/nomo/6-7-8-plus.png"> 
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,minimal-ui">
    <link href="icon.png" sizes="256x256" rel="apple-touch-icon">
</head>
<style>
    * {
        margin: 0;
        padding: 0;
    }
</style>

<body>
    <div id="guide" style="display: none">
        这里是引导用户操作的 UI，比如：“点击下方工具栏中间的分享图标，再选择‘添加到主屏幕’”。默认隐藏。
    </div>

    <div id="standalone" style="display: block">
        这里是点击图标后显示的界面，当设置了启动画面便不会显示。
    </div>

    <script>
        if (window.navigator.standalone) {
            /*  当点击桌面图标时的逻辑 */
            // 跳转到 nomo 指定相机的 URL schemes
            const url = 'nomocamera://21';
            window.location.href = url;
        } else {
            /* 当在 Safari 中显示时的逻辑 */
            // 显示用户引导 UI
            document.getElementById('page').style.display = 'block';
            // 隐藏点击图标时显示的 UI
            document.getElementById('standalone').style.display = 'none';
        }
    </script>
</body>

</html>
```





## 代码解释



### WEB APP 相关配置



WEB APP 的各种表现是通过 HTML 中的私有属性来配置的，这些属性一般在 `<head />`中，以 `<meta />`  或 `<link />` 设置。 官方文档在 [这里](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html) 。



#### 隐藏 Safari UI（即与原生 APP 一样全屏幕运行 WEB APP）

使用  `apple-mobile-web-app-capable` meta tag

若该 tag 的值为 `yes`，则表现为全屏幕运行，点击桌面图标不会跳转到 Safari 浏览器。

即上述代码中的：

```html
<meta name="apple-mobile-web-app-capable" content="yes">
```



#### 设置添加到桌面的图标

通过 <link /> 标签的` rel = "apple-touch-icon" ` 

即上述代码中的：

```html
<link sizes="256x256" rel="apple-touch-icon" href="./nomo-camera-icon.png">
```

`href` 为图标的地址，要求为正方形的图片，格式最好为png，不必裁切圆角。

其中 `sizes="256x256"` 可以不设置，`href` 也是支持 `data:image/png;base64,XXX…` 这样的 data URL，这也就意味着**我们可以使用代码动态生成图片（比如 DOM 中的 canvas）导出为 data URL 使用，而不必提前生成并上传到 CDN 的在线图片**。



#### 设置添加到桌面的标题

这个不必特意设置，会默认使用 html 的 `<title />`。

但是也有私有属性能够设置，即使用  `apple-mobile-web-app-title` meta tag

所以，下面两种方式都可以：

```html
<title>NOMO 相机名称</title>
```


```html
<meta name="apple-mobile-web-app-title" content="NOMO 相机名称">
```



#### 设置状态栏风格（即颜色）

这里的状态栏风格指的是全屏运行时显示 iOS 状态栏的颜色。

使用 `mobile-web-app-status-bar-style` meta tag

若该 tag 的值为 `yes`，则表现为全屏幕运行，点击桌面图标不会跳转到 Safari 浏览器。

即上述代码中的：

```html
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

这就可以将状态栏风格设置成透明（使用网页中 body 的背景色，但是状态栏文字为白色）。

`content` 的取值可以是：

|    `content`取值    |         表现         |                 备注                 |
| :-----------------: | :------------------: | :----------------------------------: |
|      `default`      | 白色状态栏，黑色文字 |         状态栏区域不显示网页         |
|       `black`       | 黑色状态栏，白色文字 |         状态栏区域不显示网页         |
| `black-translucent` | 透明状态栏，白色文字 | 状态栏区域显示网页，需要设置间隔避让 |



#### 设置启动画面

这一个设置比较复杂

通过 <link /> 标签的` rel = "apple-touch-startup-image" ` 

即上述代码中的：

```html
 <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" href="https://p1.cug123.com/nomo/6-7-8-plus.png"> 
```

`href` 为启动图的地址，格式最好为png。与图标设置一样，`href` 也是支持 data URL 的。



启动图的设置与原生 APP 中的 [Launch Screen](https://developer.apple.com/design/human-interface-guidelines/ios/icons-and-images/launch-screen/) （ iOS  Human Interface Guidelines 文档）设置相同。

经过测试，需要设置不同尺寸的启动图，以 media 媒体查询来选择。如果设置的尺寸与当前设备型号不匹配，则不会显示。

比如`  media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" `就表示 iPhone 6、7、8 Plus 的尺寸。



具体尺寸见如下图：

|              型号               | 逻辑分辨率 | Device Pixel Ratio | 物理分辨率 | 启动图尺寸 |
| :-----------------------------: | :--------: | :----------------: | :--------: | ---------- |
|          iPhone XS Max          |  414*896   |         3          | 1242*2688  | 1242*2688  |
|            iPhone Xr            |  414*896   |         2          |  828*1792  | 828*1792   |
|          iPhone X / Xs          |  375*812   |         3          | 1125*2436  | 1125*2436  |
| iPhone 6 Plus / 7 Plus / 8 Plus |  414*736   |         3          | 1242*2208  | 1242*2208  |
|      iPhone 6 / 6s / 7 / 8      |  375*667   |         2          |  750*1334  | 750*1334   |
|     iPhone 5 / 5c / 5s / SE     |  320*568   |         2          |  640*1136  | 640*1136   |



所以我们要针对不同的型号来加载不同的启动图。



这里有两种判断方式：



##### media 查询判断

当采用事先准备好的启动图时，可以预设不同的尺寸，使用 media 查询来判断。

```html
media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)
```

以上面的条件为例，`device-width` 和 `device-height` 分别对应为设备逻辑分辨率的 宽 和 高，`device-pixel-ratio` 则对应为设备的 Device Pixel Ratio  （物理分辨率与逻辑分辨率的比值）。根据上表，这个条件就匹配了 iPhone 6 Plus / 7 Plus / 8 Plus  等型号。



完整的代码如下：

```html
<link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" href="https://p1.cug123.com/nomo/xs-max.png"> 

<link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" href="https://p1.cug123.com/nomo/xr.png"> 

<link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="https://p1.cug123.com/nomo/x-xs.png"> 

<link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" href="https://p1.cug123.com/nomo/6-7-8-plus.png"> 

<link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="https://p1.cug123.com/nomo/6-7-8-s.png">

<link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" href="https://p1.cug123.com/nomo/5-5c-5s.png">
         
```





##### JavaScript 判断

如果我们不使用时先准备好的启动图，而使用 JavaScript 生成，那么我们就需要判断当前的设备尺寸来指定生成图片的大小。JavaScript 也提供了相应的 BOM API：

```javascript
const height = window.screen.height;
const width = window.screen.width;
const dpr = window.devicePixelRatio;

/* width 和 height 分别对应为设备逻辑分辨率的 宽 和 高，dpr 则对应为设备的 Device Pixel Ratio */

```

那么我们可以根据 `逻辑分辨率 * Device Pixel Ratio = 物理分辨率 = 启动图尺寸  ` 来计算要生成的启动图尺寸，然后把生成的图导出为 data URL 设置 `href`  属性并设置 `link` 标签即可。



⚠️ 使用 js 判断出后，仅仅需要设置匹配当前设备的 media 查询即可，所以只需生成匹配当前设备只尺寸的启动图。



####  细节

##### 关于后台

跟 APP 一样，这个 WEB APP 也是有后台的，当没有设置启动画面时，后台预览中显示网页中的内容，当设置了启动画面时，后台预览中显示启动画面。



#### 总结

通过这几个设置，我们把从桌面点击图标启动 WEB APP 的行为都设置好了，现在启动它会全屏运行，并显示我们设置的启动画面了。下面介绍 JavaScript 逻辑设置。





### JavaScript 代码逻辑



回顾一下在概览中提到的思路：

> 所以思路就有了，我们根据 WEB APP 的两种不同状态分别执行不同的动作：
>
> **·**  当在 Safari 中打开时，显示引导用户添加到主屏幕的提示性 UI
> **· ** 当点击桌面图标打开时，跳转到 NOMO 指定相机的 URL SCHEME



前面也说过 WEB APP 在 Safari 中打开时，与普通网页一样。并且 JavaScript 也提供了 BOM API 来判断是否是在 Safari 中打开还是 全屏打开。



```html

 <script>
   			// 通过 window.navigator.standalone 来判断是否全屏幕启动
        if (window.navigator.standalone) {
            /*  当点击桌面图标时启动的逻辑 */
            // 立即跳转到 nomo 指定相机的 URL schemes
            const url = 'nomocamera://21';
            window.location.href = url;
        } else {
            /* 当在 Safari 中显示时的逻辑 */
            // 显示用户引导 UI
            document.getElementById('page').style.display = 'block';
            // 隐藏点击图标时显示的 UI
            document.getElementById('standalone').style.display = 'none';
        }
    </script>
```



那么在 html 中，我们需要编写引导用户添加到主屏幕的 UI ，并使用 JavaScript 来控制两种状态下的显示与隐藏。

```html
<div id="guide" style="display: none">
        这里是引导用户操作的 UI，比如：“点击下方工具栏中间的分享图标，再选择‘添加到主屏幕’”。默认隐藏。
 </div>

<div id="standalone" style="display: block">
        这里是点击图标后显示的界面，当设置了启动画面便不会显示。
</div>
```



### 具体实现

根据上面的叙述，我们只需要引导用户打开这个我们生成的页面就好了。iOS 也有这样的 API（在 Safari 中打开一个特定的 URL，但不是在 App 内置的 WebView 中打开）。

在具体实现的时候还是有几个细节的需要注意。

#### 使用 data URL

我们添加到桌面的这个网页，不能使用 http URL。

比如，如果我们把 `https://nomo.example.com/camera?idx=1` 这个网页添加到主屏幕，当我们第一次点击他的时候可以正常运行，但是我们返回主屏幕后再次点击，却不起作用了。

这个原因跟上上节中介绍的 后台有关，http URL 的 WEB APP 后保持后台，首次打开的时候会执行跳转代码，再次打开的时候后台还存活，可是这时候代码已经执行完了，所以就不起作用了（不会跳转）。



所以，我们需要一个解决方案，就是使用 data URL，可以查看 MDN 上的 [介绍](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/data_URIs)。



data URL 的组成 `data:[<mediatype>][;base64],<data>` ，其中 mediatype 不仅支持 image 类型的，也支持 `text/html`，即 我们可以把我们要打开的 HTML 网页源代码，使用 base64 编码成 data URL 再打开，这样跟打开 http URL 效果一样，也支持添加到主屏幕，**并且无论有没有后台，在第二次点击时都会重新渲染一遍（也就是重新执行代码），就解决了这个问题**。



举个例子，我们最终在 Safari 浏览器打开的链接是这样的：

```
data:text/html;base64,XXXXXXXXXXX
```



#### 跳转方式

使用 data URL 也有局限，不能使用查询字符串等，iOS App 中可能限制了直接在 Safari 中打开 data URL。

并且考虑到我们可能需要自定义生成图标与启动图，所以我们增加一个中转页面是一个不错的方案。

这个中转页面负责生成图标与启动图，并且拼接 HTML 、转为 data URL，并跳转。

简化逻辑如下：

```javascript
// 可以根据 URL 参数来获得相机的信息
const info = {
  name: '相机name',
  desc: '相机描述',
  image: '相机图标',
}

// 生成桌面图标
info.icon = generateIcon(info.image);
// 生成启动图
info.startupImage = generateStartupimage(info);
// 拼接生成 HTML
const html = generateHTML(info);
// base64 编码 html
const b64Html = Base64.encode(html);
// 拼接并跳转 data URL
window.location.href = 'data:text/html;base64,' + b64Html;    
```



那么，我们可以直接在 App 中直接打开这个跳转页就可以了。

比如，我们要生成 idx 为 22 的相机，那么我们可以直接跳转到 Safari 打开 `https://nomo.example.com/jump?idx=22` ，这个网页会完成准备工作后跳转到 data URL，由于 Javascript 的运行速度非常快，用户察觉不到有跳转的动作。



### 总结

按照以上的思路，我们只需要完成跳转页的代码逻辑就可以了。

这也是这个仓库代码的的主要任务。























