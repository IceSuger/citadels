// pages/help/help.js
var Zan = require('../../zanui/index');

Page(Object.assign({}, Zan.Tab, {

	/**
	 * 页面的初始数据
	 */
	data: {
		tabInHelp: {
			list: [{
				id: 'rule',
				title: '游戏规则'
			}, {
				id: 'cards',
				title: '建筑牌介绍'
			}, {
				id: 'roles',
				title: '角色介绍'
			}],
			selectedId: 'rule',
			scroll: false
		}
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

	},

	handleZanTabChange(e) {
		var componentId = e.componentId;
		var selectedId = e.selectedId;

		this.setData({
			[`${componentId}.selectedId`]: selectedId
		});
	},
}));