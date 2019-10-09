// 图片加载函数
const loadImage = src =>
    new Promise(
        (resolve, reject) => {
            const img = new Image();
            img.setAttribute("crossOrigin", 'Anonymous')
            img.src = src;
            img.onload = () => {
                resolve(img);
            }
        }
    );

// 如果选择有相机图标作为启动图，那么需要用此函数来绘制
const generateStartUpImage = (icon) => {
    const height = window.screen.height;
    const width = window.screen.width;
    const dpr = window.devicePixelRatio;
    const canvas = document.createElement('canvas');
    const canvasHeight = height * dpr;
    const canvasWidth = width * dpr;
    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    let iconSize = canvasWidth / 4;
    ctx.drawImage(icon, (canvasWidth - iconSize) / 2, (canvasHeight - iconSize) / 2, iconSize, iconSize);

    return {
        image: canvas.toDataURL(),
        height: height,
        width: width,
        dpr: dpr
    }
}

// 根据设置生成添加到桌面的图标（背景颜色或者牛皮背景）
const generateIcon = (image, background, isImage) => {
    const canvas = document.createElement('canvas');
    canvas.height = 256;
    canvas.width = 256;
    const ctx = canvas.getContext('2d');
    if (isImage) {
        ctx.drawImage(background, 0, 0);
    } else {
        if (/^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/i.test(background)) {
            ctx.fillStyle = background;
        }
        ctx.fillRect(0, 0, 256, 256);
    }
    ctx.drawImage(image, 16, 16);
    return canvas.toDataURL();
}

// 核心函数，生成最终的字符串
const generateHTML = (info) => {
    // 根据条件，生成与启动图相关的 link rel
    let startupImagesString = ``;
    if (info.showStartUpImage) {
        if (info.startUpImageType === 'origin') {
            startupImagesString = `
        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" href="https://p1.cug123.com/nomo/xs-max.png"> 
        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" href="https://p1.cug123.com/nomo/xr.png"> 
        <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="https://p1.cug123.com/nomo/x-xs.png"> 
        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" href="https://p1.cug123.com/nomo/6-7-8-plus.png"> 
        <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="https://p1.cug123.com/nomo/6-7-8-s.png">
        <link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" href="https://p1.cug123.com/nomo/5-5c-5s.png">
            `;
        }
        else if (info.startUpImageType === 'icon') {
            let startupImageInfo = generateStartUpImage(info.iconImage);
            startupImagesString = `
            <link rel="apple-touch-startup-image" media="(device-width: ${startupImageInfo.width}px) and (device-height: ${startupImageInfo.height}px) and (-webkit-device-pixel-ratio: ${startupImageInfo.dpr})" href="${startupImageInfo.image}">
            `;
        }
    }
    // 返回 HTML 代码
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${ info.name}</title>
    ${startupImagesString}
    <meta content="yes" name="apple-mobile-web-app-capable">
    <meta content="black-translucent" name="apple-mobile-web-app-status-bar-style">
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1">
    <link id="apple-icon" rel="apple-touch-icon">
</head>
<script>
    document.documentElement.style.fontSize = 100 * document.documentElement.clientWidth / 375 + "px";
    const cameraInfo = {
        icon: \`${ info.icon}\`,
        name: \`${ info.name}\`,
        desc: \`${ info.desc}\`
    };
    document.getElementById('apple-icon').href = cameraInfo.icon;
</script>
<style>
    * {
        margin: 0;
        padding: 0;
    }

    body,
    html {
        height: 100%;
        width: 100%;
        overflow: hidden;
        background: #f3f2f2;
        text-align: center;
        font-size: 16px;
        font-family: "Avenir", Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
    }

    header {
        margin: .2rem 0;
    }

    header .desc {
        font-size: 0.12rem;
        padding: 0.05rem 0.2rem;
        text-align: left;
    }

    h1.title {
        background-image: linear-gradient(60deg, #29323c 0%, #485563 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        font-size: .2rem;
        font-weight: normal;
    }

    h1.title .camera-name {
        font-size: 150%;
        background-image: linear-gradient(to right, orangered, orange, gold, lightgreen, cyan, dodgerblue, mediumpurple, hotpink, orangered);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: hue 4s linear infinite;
        font-weight: 500;

    }

    @keyframes hue {
        from {
            filter: hue-rotate(0deg);
        }

        to {
            filter: hue-rotate(360deg);
        }
    }

    .preview-container {
        width: 2.1rem;
        margin: 0 auto;

    }

    .preview {
        width: 100%;
        padding-top: 85%;
        background: url('https://p1.cug123.com/nomo/nomo.png');
        background-position: center center;
        background-size: cover;
        position: relative;
    }

    .camera-icon {
        position: absolute;
        overflow: hidden;
        border-radius: 17.543%;
    }

    .camera-icon.out {
        width: 48%;
        right: 2.5%;
        top: 21.5%;
    }

    .camera-icon.inner {
        width: 5%;
        left: 32.2%;
        top: 47%;
    }

    .preview .camera-name {
        position: absolute;
        width: 48%;
        right: 2.5%;
        top: 80%;
        font-size: .14rem;
    }

    footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
    }

    footer .arrow img {
        height: .32rem;
    }

    .guide {
        position: relative;
        width: 90%;
        max-width: 3.2rem;
        margin: 0 auto;
    }

    .guide .tips {
        width: 100%;
        padding-top: 40%;
        background: url('https://p1.cug123.com/nomo/guide.png');
        background-position: center center;
        background-size: cover;
        position: relative;
    }

    .tips .text {
        position: absolute;
        right: 32%;
        bottom: 93%;
        text-align: left;
        font-size: 0.12rem;
    }

    .text .share-icon {
        height: 0.18rem;
        margin-left: 0.03rem;
    }

    .page {
        display: none;
    }

    .standalone {
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .show {
        display: block;
    }

    .hidden {
        display: none;
    }
</style>

<body>
    <div id="page" class="hidden">
        <header>
            <h1 class="title"> 把 <span id="title-name" class="camera-name"></span> 相机添加到桌面 </h1>
            <div id="desc" class="desc">
            </div>
        </header>
        <main>
            <div class="preview-container">
                <div class="preview">
                    <img id="icon-out" class="camera-icon out" src="" alt="">
                    <img id="icon-inner" class="camera-icon inner" src="" alt="">
                    <span id="icon-name" class="camera-name"></span>
                </div>
            </div>
        </main>
        <footer>
            <div class="guide">
                <div class="tips">
                    <div class="text">
                        <p>点击下方工具栏上的<img class="share-icon" referrerpolicy="no-referrer"
                                src="https://p1.cug123.com/nomo/share.png" alt=""></p>
                        <p>再点击“添加到主屏幕”</p>
                    </div>
                </div>
            </div>
            <div class="arrow">
                <img referrerpolicy="no-referrer" src="https://p1.cug123.com/nomo/arrow.png" alt="">
            </div>
        </footer>
    </div>

    <div id="standalone" class="standalone">
        📷 
    </div>

    <script>

    function handleVisibilityChange() {
        if (document.hidden) {
          //pauseSimulation();
        } else  {
            const url = 'nomocamera://${info.id}'
            window.location.href = url;
        }
      }
      
      document.addEventListener("visibilitychange", handleVisibilityChange, false);
        if (window.navigator.standalone) {
            // 跳转到 nomo 的逻辑
            const url = 'nomocamera://${info.id}'
            window.location.href = url;
        } else {
            // 提示添加到桌面逻辑
            const titleName = document.getElementById('title-name');
            titleName.innerText = cameraInfo.name;
            if(cameraInfo.name.length>10){
                titleName.style.setProperty('font-size','120%');
            }
            document.getElementById('desc').innerText = cameraInfo.desc;
            document.getElementById('icon-name').innerText = cameraInfo.name;
            document.getElementById('icon-out').src = cameraInfo.icon;
            document.getElementById('icon-inner').src = cameraInfo.icon;
            document.getElementById('page').classList.remove('hidden');
            document.getElementById('standalone').classList.add('hidden');
        }
    </script>
</body>
</html>
`;
}

export { loadImage, generateIcon, generateHTML }