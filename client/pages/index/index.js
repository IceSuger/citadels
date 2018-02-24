//index.js
var Zan = require('../../zanui/index');
var pomelo = require('../../lib/pomeloclient-over1.7.0');
const config = require('./config');
//获取应用实例
const app = getApp()

Page(Object.assign({}, Zan.TopTips, Zan.Field, {
  data: {
    config,
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    rid: '',
    passwd: ''
  },

  handleZanFieldChange(e) {
    const { componentId, detail } = e;
    //var componentId = e.componentId;

    //console.log('[zan:field:change]', componentId, detail);
    this.setData({
      [`${componentId}`]: detail.value
    })
  },

  handleZanFieldFocus(e) {
    const { componentId, detail } = e;

    //console.log('[zan:field:focus]', componentId, detail);
  },

  handleZanFieldBlur(e) {
    const { componentId, detail } = e;

    //console.log('[zan:field:blur]', componentId, detail);
  },

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    //初始化pomelo连接，并保存在app中，全局变量
    app.pomelo = require('../../lib/pomeloclient-over1.7.0');
    app.pomelo
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // //进入房间
  //   // enterRoom: function () {
  // 	// wx.getSystemInfo({
  // 	// 	success: function(res) {
  // 	// 		console.log(res);
  // 	// 		if(res.SDKVersion >= "1.7.0")
  // 	// 		{
  // 	// 			console.log("greater than 1.7.0");
  // 	// 		}
  // 	// 		else{
  // 	// 			console.log('less than 1.7.0');
  // 	// 		}
  // 	// 	},
  // 	// });
  // 	//向服务器请求进入房间，服务器判断是否可进
  // 	//是，则转到本局游戏
  // 	wx.navigateTo({
  // 		url: '../game/game'
  // 	})
  // 	//否，则toast提示原因
  // },

  enterRoom: function () {
    var _this = this;
    wx.navigateTo({
      url: '../game/game?rid=' + _this.data.rid + '&passwd=' + _this.data.passwd,
    })
  },

  enterRoom0: function () {
    var _this = this;
    //初始化 pomelo 的 websocket 连接
    this.queryEntry(function (host, port) {
      pomelo.init({
        host: host,	//connector的host和port
        port: port,
        log: true,
      }, function () {
        var route = "connector.entryHandler.createRoom";
        var createRoomParam = {
          passwd: _this.data.roomPasswd,
          playerTotal: _this.data.stepper1.stepper
        };
        pomelo.request(route, createRoomParam, function (data) {
          pomelo.disconnect();
          // if (data.error == 1) {
          // 	//提示房间已存在
          // 	//this.showZanTopTips('房间已存在');
          // 	return;
          // }
          _this.setData({
            rid: data.rid
          });
          _this.showError(_this.data.rid);
          console.log(_this.data.rid);
        });
      });
    });
  },

  // query connector
  queryEntry(callback) {
    var _this = this;
    var route = 'gate.gateHandler.queryEntry';
    pomelo.init(gateParams, function () {
      pomelo.request(route, {
        uid: 1	//现在为空！
      }, function (data) {
        pomelo.disconnect();
        // console.log(data);
        if (data.code === 500) {
          //顶部报错：连接失败（500）
          //_this.showError('gate server: 连接失败（500）');
          return;
        }
        callback(data.host, data.port);
      });
    });
  },

  createRoom111: function () {
    var _this = this;
    //请求后台根据密码和人数创建房间，并返回房间号
    this.queryEntry(function (host, port) {
      pomelo.init({
        host: host,	//connector的host和port
        port: port,
        log: true,
      }, function () {
        var route = "connector.entryHandler.createRoom";
        var createRoomParam = {
          passwd: _this.data.roomPasswd,
          playerTotal: _this.data.stepper1.stepper
        };
        pomelo.request(route, createRoomParam, function (data) {
          pomelo.disconnect();
          // if (data.error == 1) {
          // 	//提示房间已存在
          // 	//this.showZanTopTips('房间已存在');
          // 	return;
          // }
          _this.setData({
            rid: data.rid
          });
          _this.showError(_this.data.rid);
          console.log(_this.data.rid);
        });
      });
    });
  },

  //创建房间
  createRoom: function () {
    wx.navigateTo({
      url: '../newroom/newroom'
    })
  }
}));
