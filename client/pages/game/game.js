// pages/game/game.js
const roleConfig = require('./roleConfig');

Page({

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

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
    console.log(options);
    enterRoom(options);
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

  enterRoom: function () {
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
  }
})