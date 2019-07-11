import React from 'react';
import './App.css';
import camerasList from './data';
import leatherImage from './leather.png';
import { Link } from "react-router-dom";

// 主页面


// 相机列表
function Cameras(props) {
  const figureStyle = {}
  let settingsQuery = '&';
  if (props.settings.isLeather) {
    figureStyle.backgroundImage = `url(${leatherImage})`;
    settingsQuery += `leather=1`
  } else {
    figureStyle.background = '#' + props.settings.color;
    settingsQuery += `leather=0&background=${props.settings.color}`
  }

  if (props.settings.showStartUpImage) {
    settingsQuery += '&show_startup_image=1';
    settingsQuery += `&startup_image_type=${props.settings.startUpImageType}`;
  } else {
    settingsQuery += '&show_startup_image=0'
  }

  return (
    <ul className="cameras">
      {
        camerasList.map((item, index) =>
          (
            <li key={index} className="item">
              <figure className="figure" style={figureStyle}>
                <img className="icon" src={item.image} alt="" />
              </figure>
              <div className="info">
                <div className="name">{item.name}</div>
                <div className="desc">{item.desc}</div>
              </div>
              <div className="add">
                <Link to={{ pathname: `/jump?idx=${index + settingsQuery}` }} className="button" target="_blank">添加</Link>
              </div>
            </li>
          )
        )
      }
    </ul>
  );
}

// 设置面板
class Settings extends React.Component {

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onSettingChange(e);
  }


  render() {

    return (
      <div className="settings-panel">
        <ul className="settings-item">
          <li>
            <div className="label">
              图标牛皮背景
          </div>
            <div className="content">
              <label className="toggle">
                <input name="is-leather" onChange={this.handleChange} type="checkbox" checked={this.props.settings.isLeather} />
                <i></i>
              </label>
            </div>
          </li>

          <li style={{display:this.props.settings.isLeather?'none':false}}>
                <div className="label">
                  输入背景颜色
                </div>
                <div className="content input">
                  <span style={{ marginRight: '5px' }}> # </span> <input type="text" value={this.props.settings.color} onChange={this.handleChange} autoCapitalize="on" pattern="([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$" placeholder="请输入十六进制颜色" name="color-input" />
                </div>
              </li>
          <li>·
            <div className="label">
              显示启动画面
          </div>
            <div className="content">
              <label className="toggle">
                <input name="show-startup-image" onChange={this.handleChange} type="checkbox" checked={this.props.settings.showStartUpImage} />
                <i></i>
              </label>
            </div>
          </li>
          <li style={{display:this.props.settings.showStartUpImage?false:'none'}}>
            <div className="label">
              启动画面类型
          </div>
            <div className="content">
              <div className="radio">
                <label >
                <input type="radio" defaultChecked={this.props.settings.startUpImageType==='origin'} onChange={this.handleChange}  name="image-type" value="origin" />
                App 原启动画面
                </label>
                <label >
                <input type="radio" defaultChecked={this.props.settings.startUpImageType==='icon'} onChange={this.handleChange} name="image-type" value="icon" />
                相机图标
                </label>
              </div>
            </div>
          </li>
        </ul>
      </div>
    );
  }
}

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      isLeather: true,
      color: '',
      showStartUpImage: true,
      startUpImageType: 'origin'
    }
    this.handleSetting = this.handleSetting.bind(this);
  }


  handleSetting(e) {
    const name = e.target.name;
    if (name === 'is-leather') {

      const newState = {
        isLeather: e.target.checked,
      }

      if (!this.state.color) {
        newState.color = 'CCC';
      }

      this.setState(newState);

    } else if (name === 'show-startup-image') {
      this.setState({
        showStartUpImage: e.target.checked,
      });

    }
    else if (name === 'image-type') {
      this.setState({
        startUpImageType: e.target.value,
      });

    }
    else {
      const value = e.target.value.toUpperCase();
      this.setState({
        isLeather: false,
        color: value
      })
    }
    return;
  }

  render() {
    return (
      <div className="app">
        <header className="App-header">
          <h1 className="title">把 NOMO 相机添加到桌面 - DEMO</h1>
          <div className="split">
            <div className="hr"></div>
            设置
            <div className="hr"></div>
          </div>
          <Settings settings={this.state} onSettingChange={this.handleSetting} />
        </header>
        <main>
          <div className="split">
            <div className="hr"></div>
            预览
            <div className="hr"></div>
          </div>
          <Cameras settings={this.state}/>
        </main>
      </div>
    );
  }
}


export default App;
