// pages/game/game.js
const roleConfig = require('./roleConfig');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		player: {
			wx_name: '', //微信名字
			avatarUrl: '', //微信头像
			seatInRoom: 0,  //房间内座次（即进入房间的顺序）
			buildingCnt: 0,    //已拥有建筑总数
			buildingList: [],    //已有建筑列表
			coins: 0,	//手上的金币数
			buildingCardList: [],   //手上的建筑卡列表
			handCnt: 0,   //手牌数
			role: -1    //当前角色
		},
		roles: roleConfig.roles,

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {

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

	}
})