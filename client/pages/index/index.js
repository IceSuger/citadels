//index.js
var Zan = require('../../zanui/index');
const config = require('./config');
//获取应用实例
const app = getApp()

Page(Object.assign({}, Zan.TopTips, Zan.Field, {
    data: {
		config,
        motto: 'Hello World',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
	
	handleZanFieldChange(e) {
		const { componentId, detail } = e;

		console.log('[zan:field:change]', componentId, detail);
	},

	handleZanFieldFocus(e) {
		const { componentId, detail } = e;

		console.log('[zan:field:focus]', componentId, detail);
	},

	handleZanFieldBlur(e) {
		const { componentId, detail } = e;

		console.log('[zan:field:blur]', componentId, detail);
	},

    //事件处理函数
    bindViewTap: function() {
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
        } else if (this.data.canIUse){
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
    },
    getUserInfo: function(e) {
        console.log(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },
	//进入房间
    enterRoom: function () {
		// wx.getSystemInfo({
		// 	success: function(res) {
		// 		console.log(res);
		// 		if(res.SDKVersion >= "1.7.0")
		// 		{
		// 			console.log("greater than 1.7.0");
		// 		}
		// 		else{
		// 			console.log('less than 1.7.0');
		// 		}
		// 	},
		// });
		//向服务器请求进入房间，服务器判断是否可进
		//是，则转到本局游戏
		wx.navigateTo({
			url: '../game/game'
		})
		//否，则toast提示原因
	},
	//创建房间
	createRoom: function () {
		wx.navigateTo({
			url: '../newroom/newroom'
		})
	}
}));
