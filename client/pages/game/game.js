// pages/game/game.js
var Zan = require('../../zanui/index');
const roleConfig = require('./roleConfig');
const consts = require('../../utils/consts');
const app = getApp();
var pomelo = app.pomelo;

Page(Object.assign({}, Zan.TopTips, Zan.Tab, Zan.CheckLabel, Zan.Dialog, {

	/**
	 * 页面的初始数据
	 */
	data: {
		tab: {
			list: [{
				id: 'situation',
				title: '局势'
			}, {
				id: 'move',
				title: '行动'
			}, {
				id: 'hand',
				title: '手牌'
			}, {
				id: 'help',
				title: '帮助'
			}],
			selectedId: 'situation',
			scroll: false
		},
		//选角色相关
		pickableRoleList: [
			{
				padding: 0,
				value: '1',
				name: '选项一',
			},
			// {
			// 	padding: 0,
			// 	value: '2',
			// 	name: '选项二',
			// },
		],
		checkedRole: -1,
		bannedAndShownRoleList: [],
		roleIdPicked: null,

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
		mySeatNum: null,
		curPlayer: null,

		playerReady: false,
		gameOn: false
	},

	showError(content) {
		this.showZanTopTips(content);
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		console.log(options);
		this.setData({
			roomId: options.roomId
		})
		wx.setNavigationBarTitle({
			title: '房间 ' + options.roomId,
		})
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
		pomelo.disconnect();
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

		//把收到的dict转为本地的list
		var playerList = [];
		for (let item in playerDict) {
			var _item = playerDict[item];
			_item['buildingList'] = [];
			for (let building in _item['buildingDict']) {
				_item['buildingList'].push(_item['buildingDict'][building]);
			}
			//增加一些用于本地显示的属性
			_item.ready = false;
			_item.roleName_zh = _this.data.roles[Number(_item.role)].name_zh;
			playerList.push(_item);
		}

		if (!_this.data.mySeatNum) {
			var mySeatNum = null;
			playerList.forEach(function (value, index, _) {
				// console.log('value.uid:');
				// console.log(value.uid);
				// console.log('app.globalData.uid:');
				// console.log(app.globalData.uid);
				if (value.uid === app.globalData.uid) {
					//这是我。
					mySeatNum = index;
				}
			})
			_this.setData({
				mySeatNum: mySeatNum
			})
		}

		_this.setData({
			playerList: playerList
		})
		console.log(playerList);
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
				_this.data.playerList.forEach(function (value, index, _) {
					var ready = false;
					msg.readyPlayers.forEach(function (vj, ij, _j) {
						if (vj === value.uid) {
							ready = true;
						}
					})
					_this.setData({
						// 'playerList[index+1].ready': ready,
						[`playerList[${index}].ready`]: ready
					})
				})
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
		//按下准备之前，先开始监听开局消息
		pomelo.on('onPickingRole', _this.onPickingRole);
		pomelo.on('onSituationUpdate', function (msg) {
			// console.log('roomMemberChange' + msg);
			_this.updatePlayers(msg.playerDict);
		});
		pomelo.request("core.coreHandler.ready", {}, function (data) {
			console.log(data);
			if (data.ret === consts.GET_READY.OK) {
				_this.setData({
					playerReady: true
				})
			}
		})
	},

	pickRole: function (e) {
		var _this = this;
		console.log(e);
		var roleId = Number(e.currentTarget.id);
		//弹对话框，确认是否选这个角色？
		var msg = {
			event: consts.CLIENT_ONLY.EVENT.PICK_ROLE,
			roleId: roleId
		}
		_this.showConfirm(msg)
	},

	showConfirm(msg) {
		var _this = this;
		var dialogMsg = null;
		if (msg.event === consts.CLIENT_ONLY.EVENT.PICK_ROLE) {
			//确认选角色
			dialogMsg = {
				title: '确认角色',
				content: `确认选择 ${msg.roleId} 号角色 ${_this.data.roles[msg.roleId].name_zh} 吗？`,
				showCancel: true
			}
		}
		this.setData({
			roleIdPicked: msg.roleId
		})

		this.showZanDialog(dialogMsg
		).then(_this.confirmPickRole
			).catch(() => {
				// console.log('=== dialog ===', 'type: cancel');
			});
	},

	confirmPickRole() {
		// console.log('CONFIRMMING PICKING ROLE.');
		// console.log(this.data.roleIdPicked);
		var msg = {
			roleId: this.data.roleIdPicked
		}
		pomelo.request("core.coreHandler.pickRole", msg, null);//null指不传入callback，单向通知服务器。
		//发出选角色的请求后，退回“局势”
		this.switchToTab('situation');
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
	},

	onPickingRole(msg) {
		var _this = this;
		console.log(msg);
		//开始选角色了，表明游戏开始了，标记一下，便于局势渲染。尽管每次收到选角色的推送都会标记一次，但开销很小无所谓。
		_this.setData({
			gameOn : true
		})

		var curPlayer = msg.curPlayer;
		_this.setData({
			curPlayer: curPlayer
		})
		// console.log('curPlayer: ');
		// console.log(curPlayer);
		// console.log('mySeatNum: ');
		// console.log(_this.data.mySeatNum);
		if (curPlayer === _this.data.mySeatNum) {
			//当前该我行动
			//弹出可选角色列表
			_this.updatePickableRoleList(msg.roleList);
			_this.switchToTab('move');
		} else {
			//当前该其他玩家行动
			//弹出toptip说明当前谁在行动
			var curPlayerName = _this.data.playerList[curPlayer].wxNickName;
			_this.showError('请等待玩家 ' + curPlayerName + ' 选角色...');
		}

	},

	switchToTab(selectedId) {
		this.setData({
			'tab.selectedId': selectedId
		})
	},

	updatePickableRoleList(roleList) {
		var _this = this;
		var pickableRoleList = [];
		var bannedAndShownRoleList = [];
		roleList.forEach(function (value, index, _) {
			if (value) {
				if (value.bannedAndShown) {
					var item = {
						value: '' + value.id,
						name: _this.data.roles[value.id].name_zh,
					}
					bannedAndShownRoleList.push(item);
				} else if (value.pickable) {
					var item = {
						// padding: 0,
						value: '' + value.id,
						name: _this.data.roles[value.id].name_zh,
					}
					pickableRoleList.push(item);
				}
			}
		})
		_this.setData({
			pickableRoleList: pickableRoleList,
			bannedAndShownRoleList: bannedAndShownRoleList
		})
		console.log(pickableRoleList);
		console.log(_this.data.pickableRoleList);
	},

	handleZanTabChange(e) {
		var componentId = e.componentId;
		var selectedId = e.selectedId;

		this.setData({
			[`${componentId}.selectedId`]: selectedId
		});
	},

	handleZanSelectChange({ componentId, value }) {
		this.setData({
			[`checked.${componentId}`]: value
		});
	}
}));