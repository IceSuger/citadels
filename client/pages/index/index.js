//index.js
var Zan = require('../../zanui/index');
var pomelo = require('../../lib/pomeloclient-over1.7.0');
const consts = require('../../utils/consts');
const config = require('./config');
const MD5 = require('../../utils/md5.js')
//获取应用实例
const app = getApp()

Page(Object.assign({}, Zan.TopTips, Zan.Field, {
	data: {
		config,
		userInfo: {},
		hasUserInfo: false,
		canIUse: wx.canIUse('button.open-type.getUserInfo'),
		roomId: 0,
		passwd: '',
		btn_disabled: true
	},


	showError(content) {
		this.showZanTopTips(content);
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

	
	onLoad: function (options) {
		var _this = this;
		// console.log('MD5');
		// console.log(MD5.md5(null));

		if (app.globalData.userInfo) {
			this.setData({
				userInfo: app.globalData.userInfo,
				hasUserInfo: true
			})
			//对userInfo对象（不包含用户敏感信息如openId）做md5得到发给pomelo端的用户uid
			app.globalData.uid = MD5.md5(app.globalData.userInfo);
			console.log(app.globalData.userInfo);
			console.log(app.globalData.uid);
			this.enableBtn();
		} else if (this.data.canIUse) {
			// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
			// 所以此处加入 callback 以防止这种情况
			app.userInfoReadyCallback = res => {
				this.setData({
					userInfo: res.userInfo,
					hasUserInfo: true
				})
				//对userInfo对象（不包含用户敏感信息如openId）做md5得到发给pomelo端的用户uid
				app.globalData.uid = MD5.md5(app.globalData.userInfo);
				console.log(app.globalData.userInfo);
				console.log(app.globalData.uid);
				this.enableBtn();
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
					//对userInfo对象（不包含用户敏感信息如openId）做md5得到发给pomelo端的用户uid
					app.globalData.uid = MD5.md5(app.globalData.userInfo);
					console.log(app.globalData.userInfo);
					console.log(app.globalData.uid);
					this.enableBtn();
				}
			})
			
		}

		

	},

	/**
	 * 自动0.0.11.2版本开始，就不再在index页面查询connector了。
	 * 因为connector可以直接写死，就是 域名+目录，然后服务器端nginx将其代理到不同的pomelo端口中。
	 * 这样搞的原因是：微信小程序只允许通过wss（TLS）访问已备案域名，且不能带端口号，只能用默认的443端口。
	 */
	enableBtn() {
		var _this = this;

		//激活按钮
		_this.setData({
			btn_disabled: false
		})

	},

	onShow: function () {
		var _this = this;
		//如果是进入房间失败，从game页自动退回来的，则将错误代码写入了app全局变量
		var code = Number(app.globalData.errorCode);
		if (code) {
			if (code === consts.ENTER_ROOM.ERROR_ROOM_NOT_EXIST) {
				_this.showError('房间不存在。');
			} else if (code === consts.ENTER_ROOM.ERROR_WRONG_ROOM_PASSWD) {
				_this.showError('密码错误。');
			} else if (code === consts.ENTER_ROOM.ERROR_ROOM_FULL) {
				_this.showError('该房间已满。');
			} else {
				console.log(options);
				// _this.setData({
				// 	roomId: data.roomId
				// });
				_this.showError(options);
			}
			app.globalData.errorCode = null;
		}
	},

	getUserInfo: function (e) {
		console.log(e)
		// app.globalData.userInfo = e.detail.userInfo
		// this.setData({
		// 	userInfo: e.detail.userInfo,
		// 	hasUserInfo: true,
		// 	btn_disabled: false
		// })

		
		wx.getUserInfo({
			success: res => {
				app.globalData.userInfo = res.userInfo
				this.setData({
					userInfo: res.userInfo,
					hasUserInfo: true
				})
				//对userInfo对象（不包含用户敏感信息如openId）做md5得到发给pomelo端的用户uid
				app.globalData.uid = MD5.md5(app.globalData.userInfo);
				console.log(app.globalData.userInfo);
				console.log(app.globalData.uid);
				this.enableBtn();
			}
		})
	},


	// query pomelo connector
	queryEntry(callback) {
		var _this = this;
		var route = 'gate.gateHandler.queryEntry';
		var gateParams = {
			host: app.config.host,
			port: app.config.port_gate,
			log: true
		};
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

	//进入房间
	enterRoom: function () {
		var _this = this;
		// pomelo.disconnect();
		wx.navigateTo({
			url: '../game/game?roomId=' + Number(_this.data.roomId) + '&passwd=' + _this.data.passwd,
		})
	},
	//创建房间
	createRoom: function () {
		wx.navigateTo({
			url: '../newroom/newroom'
		})
	},
	//查看规则
	showHelp: function(){
		wx.navigateTo({
			url: '../help/help',
		})
	}
}));
