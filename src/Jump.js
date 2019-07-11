import React from 'react';
import camerasList from './data'
import leatherImage from './leather.png'
import { loadImage, generateIcon, generateHTML } from './tools'
import { Base64 } from 'js-base64';

// 跳转页
// 1. 根据参数，生成相机图标、启动图等信息
// 2. 生成最终的 HTML 字符串
// 3. base64 编码这个字符串，然后转到这个 base64 URI
class Jump extends React.Component {

    constructor(props) {
        super(props);
        // 从 URL 参数里获得各种设置
        let params = new URLSearchParams(props.location.search);
        this.item = camerasList[params.get('idx')];
        this.isLeather = !params.get('leather') || params.get('leather') === '1';
        this.background = params.get('background');
        this.showStartUpImage = !params.get('show_startup_image') || params.get('show_startup_image') === '1';
        this.startUpImageType = params.get('startup_image_type') || 'origin';
        this.action();
    }

    // 核心操作
    action() {
        const item = this.item
        const info = {
            ...item,
            showStartUpImage: this.showStartUpImage,
            startUpImageType: this.startUpImageType
        }
        const images = [loadImage(item.image)];
        if (this.isLeather) {
            images.push(loadImage(leatherImage));
        }

        let loadedImages = Promise.all(
            images
        );

        loadedImages.then(res => {
            info.iconImage = res[0];
            if (this.isLeather) {
                info.icon = generateIcon(res[0], res[1], true)
            } else {
                info.icon = generateIcon(res[0], '#' + this.background, false)
            }

            const html = generateHTML(info);
            const b64Html = Base64.encode(html);
            window.location.href = 'data:text/html;base64,' + b64Html;    
        })

    }


    render() {
        return <div>跳转中...</div>;
    }

}

export default Jump;
