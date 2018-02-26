// pages/game/game.js
var Zan = require('../../zanui/index');
const roleConfig = require('./roleConfig');
const consts = require('../../utils/consts');
const app = getApp();
var pomelo = app.pomelo;

Page(Object.assign({}, Zan.TopTips, {

	/**
	 * 页面的初始数据
	 */
	data: {
		player: {
			wx_name: '鲜鱿鱼味香脆饼', //微信名字
			avatarUrl: '', //微信头像
			seatInRoom: 0,  //房间内座次（即进入房间的顺序）
			buildingCnt: 0,    //已拥有建筑总数
			buildingList: [],    //已有建筑列表
			coins: 2,	//手上的金币数
			buildingCardList: [{
				name_zh: "龙门(特)",
				id: 1,
				cost: 6,
				color: 5,
				score: 8,
			},
			{
				name_zh: "城堡(贵)",
				id: 2,
				cost: 4,
				color: 1,
				score: 4,
			},
			{
				name_zh: "战场(军)",
				id: 2,
				cost: 3,
				color: 4,
				score: 3,
			},
			{
				name_zh: "酒馆(商)",
				id: 2,
				cost: 1,
				color: 3,
				score: 1,
			},
			{
				name_zh: "大教堂(教)",
				id: 2,
				cost: 5,
				color: 2,
				score: 5,
			},
			{
				name_zh: "城堡(贵)",
				id: 2,
				cost: 4,
				color: 1,
				score: 4,
			},
			{
				name_zh: "战场(军)",
				id: 2,
				cost: 3,
				color: 4,
				score: 3,
			},
			{
				name_zh: "酒馆(商)",
				id: 2,
				cost: 1,
				color: 3,
				score: 1,
			}],   //手上的建筑卡列表
			handCnt: 999,   //手牌数
			role: roleConfig.roles[0]    //当前角色
		},
		roles: roleConfig.roles,
		roomId: null,

		playerList: [],

		playerReady: false
	},

	showError(content) {
		this.showZanTopTips(content);
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		console.log(options);
		this.enterRoom(options);
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},

	updatePlayers(playerDict) {
		var _this = this;

		var playerList = [];
		for (let item in playerDict) {
			var _item = playerDict[item];
			_item['buildingList'] = [];
			for (let building in _item['buildingDict']) {
				_item['buildingList'].push(_item['buildingDict'][building]);
			}
			playerList.push(_item);
		}

		_this.setData({
			playerList: playerList
		})
	},

	enterRoom: function (options) {
		var _this = this;
		var roomId = Number(options.roomId);
		var passwd = options.passwd;

		pomelo.init({
			host: app.globalData.conn_host,	//connector的host和port
			port: app.globalData.conn_port,
			log: true,
		}, function () {
			var route = "connector.entryHandler.enterRoom";
			var enterRoomParam = {
				uid: app.globalData.uid,
				wxNickName: app.globalData.userInfo.nickName,
				wxAvatar: app.globalData.userInfo.avatarUrl,
				roomId: roomId,
				passwd: passwd
			};

			//先注册监听房间成员变化的事件
			pomelo.on('roomMemberChange', function (msg) {
				// console.log('roomMemberChange' + msg);
				_this.updatePlayers(msg.playerDict);
			});
			pomelo.on('roomReadyChange', function (msg) {
				// console.log('roomReadyChange' + msg);
			});

			pomelo.request(route, enterRoomParam, function (data) {
				// if (data.error == 1) {
				// 	//提示房间已存在
				// 	//this.showZanTopTips('房间已存在');
				// 	return;
				// }

				if (data.code === consts.ENTER_ROOM.OK) {
					console.log(data);
					// _this.setData({
					// 	roomId: data.roomId
					// });
					_this.showError(data);
				}
				else {
					app.globalData.errorCode = data.code;
					wx.navigateBack({
						//url: '../index/index?code=' + data.code,
					})
				}
			});
		});
	},

	getReady: function () {
		var _this = this;
		pomelo.request("core.coreHandler.ready", {}, function (data) {
			console.log(data);
			if (data.ret === consts.GET_READY.OK) {
				_this.setData({
					playerReady: true
				})
			}
		})
	},

	cancelReady: function () {
		var _this = this;
		pomelo.request("core.coreHandler.cancelReady", {}, function (data) {
			if (data.ret === consts.GET_READY.OK) {
				_this.setData({
					playerReady: false
				})
			}
		})
	}
}));