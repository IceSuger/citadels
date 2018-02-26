//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    // //初始化pomelo实例，并查询pomelo的connector
    // this.pomelo = require('./lib/pomeloclient-over1.7.0');
  },
  globalData: {
    userInfo: null,
	uid: null,
	conn_host: null,	//pomelo connector host
	conn_port: null,	//pomelo connector port
	errorCode: null,
  },
  config: {
    //host: '10.41.5.102',
    host: '123.56.1.58',
    port_gate: 3014

  },
  //全局pomelo单例
  pomelo: null
})
