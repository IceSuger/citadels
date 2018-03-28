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
	conn_host: 'bighead81.club',	//pomelo connector host
	//小程序不允许带端口号，只能用默认443.所以这里通过目录，在服务器上用nginx反向代理实现将请求转发到不同端口上。
	conn_port: '/conn/',	//pomelo connector port 
	errorCode: null,
	disconnected: false
  },
  config: {
    // host: '123.56.1.58',
	  host: 'bighead81.club',
    // port_gate: 3014
	port_gate: '/ggate/'

  },
  //全局pomelo单例
  pomelo: null
})
