// pages/newroom/newroom.js
var Zan = require('../../zanui/index');
var pomelo = require('../../lib/pomeloclient-over1.7.0');
const app = getApp()
const appConfig = app.config;
const config = require('./config');
var gateParams = {
	host: appConfig.host,
	port: appConfig.port_gate,
	log: true
};

let variables = {};


Page(Object.assign({}, Zan.TopTips, Zan.Field, Zan.Stepper, {
	/**
	 * 页面的初始数据
	 */
	data: {
		config,
		roomId: 0,
		roomPasswd: "",
		totalPlayer: 0,
		stepper1: {
			stepper: 1,//6
			min: 1,//todo: 实际版本中，2~3人玩法不同于普通局！
			max: 7
		}
	},

	showError(content) {
		this.showZanTopTips(content);
	},

	handleZanStepperChange(e) {
		var _this = this;
		var componentId = e.componentId;
		var stepper = e.stepper;

		this.setData({
			[`${componentId}.stepper`]: stepper
		});

		//this.showError(_this.data.stepper1.stepper);
	},

	handleZanFieldChange(e) {
		const { componentId, detail } = e;

		this.setData({
			roomPasswd: detail.value
		});
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

	createRoom: function () {
		var _this = this;
		//请求后台根据密码和人数创建房间，并返回房间号
		// this.queryEntry(function (host, port) {
		pomelo.init({
			host: app.globalData.conn_host,	//connector的host和port
			port: app.globalData.conn_port,
			log: true,
		}, function () {
			var route = "connector.entryHandler.createRoom";
			var createRoomParam = {
				passwd: _this.data.roomPasswd,
				totalPlayer: _this.data.stepper1.stepper
			};
			pomelo.request(route, createRoomParam, function (data) {
				pomelo.disconnect();

				_this.setData({
					roomId: data.roomId
				});
				_this.showError("房间号：" + _this.data.roomId);
				//  console.log(_this.data.roomId);
			});
		});
		// });
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
}));