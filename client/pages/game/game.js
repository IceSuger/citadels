// pages/game/game.js
var Zan = require('../../zanui/index');
const roleConfig = require('./roleConfig');
const consts = require('../../utils/consts');
const buildings = require('../../utils/buildings');
const app = getApp();
var pomelo = app.pomelo;

Page(Object.assign({}, Zan.TopTips, Zan.Tab, Zan.CheckLabel, Zan.Dialog, Zan.NoticeBar, {

	/**
	 * 页面的初始数据
	 */
	data: {
		testBool: false,
		gameOver: false,
		consts: consts,
		noticeBar: {
			text: '感谢您使用本桌游助手！',
		},
		tab: {
			list: [{
				id: 'situation',
				title: '局势'
			}, {
				id: 'move',
				title: '动作'
			}, {
				id: 'hand',
				title: '手牌'
			}, {
				id: 'log',
				title: '日志'
			}, {
				id: 'help',
				title: '帮助'
			}],
			selectedId: 'situation',
			scroll: false
		},
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
		},

		//静态建筑牌字典
		staticBuildingDict: null,
		//我的手牌
		handCards: null,
		//选角色相关
		pickableRoleList: [],
		// checkedRole: -1,
		bannedAndShownRoleList: [],
		roleIdPicked: null,
		mePickingRole: false,
		//可执行动作列表
		actionList: null,
		meTakingCoinOrCard: false,
		//从牌堆摸牌后的候选牌列表：
		candidateCardList: [],
		//从牌堆摸牌后，可以保留几张加入手牌
		pickableCardCnt: null,
		//本轮已知角色的玩家列表（元素为seatId）
		knownRolePlayers: [],
		//当前游戏状态
		curState: null,
		//我可以发动角色技能吗
		roleAbilityUsable: false,
		//我场上的建筑带有的主动技能
		buildingAbilitys: false,
		//我现在可以结束我的回合
		myRoundNow: false,
		//角色发动主动技能，选角色
		showBottomPopup: false,
		//本轮被杀的角色id，用于盗贼技能合法性判断
		roleIdKilled: null,
		//我正在进行建造
		meDoingBuild: false,
		//手牌复选框列表（用于魔术师与牌堆换牌）
		handCardsCheckBoxList: null,
		magicianExchangingWithSys: false,
		//正在选择主动技能针对的目标玩家
		mePickingTargetPlayer: false,
		//主动技能施放目标玩家
		targetPlayerSeatId: null,
		//我是军阀，已经选好了要拆谁的建筑，正在选择要拆他的哪个建筑
		pickingBuilding2demolish: false,
		//我本回合是否还能收税
		canTakeTax: true,

		//我有铁匠铺
		iHaveSmithy: false,
		//我有实验室
		iHaveLab: false,

		//墓地中待回收的卡
		cemeteryCard: null,

		roles: roleConfig.roles,
		roomId: null,

		playerList: [],
		roomMemberCnt: 0,
		roomMemberMax: 0,
		mySeatNum: null,
		myRoleId: null,
		curPlayer: null,

		playerReady: false,
		gameOn: false,
		//游戏日志
		logs: null
	},

	showError(content) {
		this.showZanTopTips(content);
	},

	initStaticBuildingDict() {
		/**
		 * 由于静态的建筑，其id都是唯一的，且都是Number，所以这里虽然名为dict，实际上却以数组来实现staticBuildingDict。
		 */
		var dict = [];
		buildings.forEach(function (value, index, _) {
			dict[value.id] = value;
		});
		this.setData({
			staticBuildingDict: dict
		});
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var _this = this;
		console.log(options);
		this.initStaticBuildingDict();
		this.initRoleNamesList();
		this.setData({
			roomId: options.roomId,
			logs: ['开始！']
		})
		// wx.setNavigationBarTitle({
		// 	title: '房间 ' + options.roomId,
		// })



		this.enterRoom(options);
	},

	pomeloAddListeners() {
		var _this = this;
		//先注册监听房间成员变化的事件
		pomelo.on('roomMemberChange', function (msg) {
			// console.log('roomMemberChange' + msg);
			_this.updatePlayers(msg.playerDict);
			wx.setNavigationBarTitle({
				title: `房间 ${app.globalData.roomId} (${_this.data.roomMemberCnt}/${_this.data.roomMemberMax})`,
			})
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
		//按下准备之前，先开始监听开局消息
		pomelo.on('onPickingRole', _this.onPickingRole);
		// 监听选完角色后的行动消息
		pomelo.on('onTakingAction', _this.onTakingAction);
		pomelo.on('onSituationUpdate', function (msg) {
			// console.log('roomMemberChange' + msg);
			_this.updatePlayers(msg.playerDict);
		});

		pomelo.on('onMove', _this.showCurMove);
		//监听游戏状态变化
		pomelo.on('onGameStateChange', _this.gameStateChange);
		//监听游戏是否结束
		pomelo.on('onGameOver', function () {
			_this.setData({
				gameOver: true
			})
			_this.switchToTab('situation');
		});
		//监听墓地行动通知
		pomelo.on('onCemetery', (msg) => {
			/**
			 * 判断当前墓地在谁手里，
			 * 若在我手里，则弹出对话框？
			 * 若不在我手里，则更新noticeBar：等这个货决定要不要回收
			 */
			var cemeteryOwnerName, cemeteryOwnerSeatId;
			_this.data.playerList.forEach((playerObj) => {
				if (playerObj.buildingDict.hasOwnProperty(consts.BUILDINGS.CEMETERY)) {
					cemeteryOwnerName = playerObj.wxNickName;
					cemeteryOwnerSeatId = playerObj.seatId;
				}
			})
			if (cemeteryOwnerSeatId === _this.data.mySeatNum) {
				//墓地是我的
				//myRoundNow = true
				/**
				 * 1.myRoundNow = true
				 * 2.cemeteryCardId = msg.cardId
				 * 3.切到“行动”页
				 */
				_this.setData({
					myRoundNow: true,
					cemeteryCard: _this.data.staticBuildingDict[msg.cardId]
				})
				_this.switchToTab('move');
			} else {
				//墓地是别人的
				_this.showNews(`请等待 ${cemeteryOwnerName} 决定是否回收该建筑...`);
			}
		});
		//监听墓地行动完成
		pomelo.on('onCemeteryDone', () => {
			/**
			 * 若我是军阀，则收到此事件后可以继续我的行动回合。
			 * myRoundNow = true;
			 */
			if (_this.data.roleIdPicked === consts.ROLES.WARLORD) {
				_this.setData({
					myRoundNow: true
				})
				_this.showNews("军阀请继续行动。");
			}
		});
		//监听日志到来
		pomelo.on('onLog', (msg) => {
			// console.log(msg);
			_this.showNews(msg.log.split('] ')[1]);
			// console.log(_this.data.logs);
			var logs = _this.data.logs;
			logs.unshift(msg.log);
			_this.setData({
				logs: logs
			})
		});
		//监听掉线
		pomelo.on('disconnect', function () {
			if (!_this.data.userForceDisconnect) {
				console.log('掉线了');
				_this.ask4Reconnect();
				//置disconnected = true；用于在每次加载页面时，判断是否弹窗问要不要重连
				app.globalData.disconnected = true;
			}
		});
		pomelo.on('heartbeat timeout', function () {
			console.log('心跳超时');
			_this.ask4Reconnect();
			//置disconnected = true；用于在每次加载页面时，判断是否弹窗问要不要重连
			app.globalData.disconnected = true;
		});
		//监听重连后单点收到的消息（本局游戏历史和当前局势）
		pomelo.on('onReconnect', function (msg) {
			_this.setData({
				logs: msg.logs
			})
			_this.updatePlayers(msg.playerDict);
		})
	},

	ask4Reconnect() {
		var _this = this;
		//弹窗，问是否重连
		wx.showModal({
			title: '是否重连',
			content: '与服务器断开了连接，是否重连？',
			confirmText: "是",
			cancelText: "否",
			success: function (res) {
				console.log(res);
				if (res.confirm) {
					console.log('用户选择重连。')
					_this.enterRoom({
						roomId: app.globalData.roomId,
						passwd: app.globalData.passwd
					});
				} else {
					console.log('用户拒绝重连。')
				}
			}
		});
	},

	initRoleNamesList() {
		var roleNames = [];
		console.log(this.data.roles);
		// this.data.roles.forEach(function(role, index, _){
		// 	if(index === 0){
		// 		continue;
		// 	}
		// 	// roleNames.push(`${index}  ${role.name_zh}`);
		// })
		var roles = this.data.roles;
		roles.forEach(function (role, index, _) {
			console.log(index);
			if (index !== 0) {
				roleNames.push(`${index}  ${role.name_zh}`);
			}
		})
		this.setData({
			roleNames: roleNames
		})
	},

	/**
	 * 开始选人、开始行动，都会触发这个。
	 */
	gameStateChange(msg) {
		this.setData({
			curPlayer: null
		})
		//清空上一轮显示的所有角色名
		this.data.playerList.forEach((_, index, __) => {
			this.setData({
				[`playerList[${index}].isRoleKnown`]: false,
				[`playerList[${index}].roleName_zh`]: this.data.roles[0].name_zh
			})
		})
		//重置move页
		this.resetTabMove();
	},

	resetTabMove() {
		this.setData({
			pickableRoleList: [],
			pickableCardCnt: null,
			//选角色相关
			pickableRoleList: [],
			bannedAndShownRoleList: [],
			// roleIdPicked: null,
			mePickingRole: false,
			//可执行动作列表
			actionList: null,
			meTakingCoinOrCard: false,
			//从牌堆摸牌后的候选牌列表：
			candidateCardList: [],
			//从牌堆摸牌后，可以保留几张加入手牌
			pickableCardCnt: null,
			//本轮已知角色的玩家列表（元素为seatId）
			knownRolePlayers: [],
			//我可以发动角色技能吗
			roleAbilityUsable: false,
			//我场上的建筑带有的主动技能
			buildingAbilitys: false,
			//我现在可以结束我的回合
			myRoundNow: false,
			//我正在进行建造
			meDoingBuild: false,
			//正在选择主动技能针对的目标玩家
			mePickingTargetPlayer: false,
			//我本回合是否还能收税
			canTakeTax: true,

			//我有铁匠铺
			iHaveSmithy: false,
			//我有实验室
			iHaveLab: false,
			//墓地中待回收的卡
			cemeteryCard: null,
		})
	},


	showCurMove(msg) {
		var _this = this;
		var curPlayer = msg.curPlayer;
		var curPlayerObj = _this.data.playerList[curPlayer];
		var curPlayerName = curPlayerObj.wxNickName;
		if (msg.move === consts.MOVE.TAKE_BUILDING_CARDS) {
			// _this.showError(curPlayerName + ' 正在拿取建筑牌...');
			_this.showNews(`请等待  ${curPlayerObj.roleName_zh}（${curPlayerName}）拿取建筑牌...`);
		}
	},

	showNews(msg) {
		this.setData({
			'noticeBar.text': msg
		})
		// // 滚动通告栏需要initScroll
		// this.initZanNoticeBarScroll('noticeBar');
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
		// 滚动通告栏需要initScroll
		this.initZanNoticeBarScroll('noticeBar');
		//判断是否已断线，若是，则询问是否重连
		if (app.globalData.disconnected === true) {
			this.ask4Reconnect();
		}
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
		//打标记：这是用户主动断开的连接
		this.setData({
			userForceDisconnect: true
		})
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
		for (let uid in playerDict) {
			var playerObj = playerDict[uid];
			playerObj['buildingList'] = [];
			for (let building in playerObj['buildingDict']) {
				console.log(building);
				playerObj['buildingList'].push(_this.data.staticBuildingDict[building]);
			}
			//增加一些用于本地显示的属性
			playerObj.ready = false;
			// playerObj.roleName_zh = _this.data.roles[Number(playerObj.role)].name_zh;
			if (playerObj.seatId !== null) {
				try {
					playerObj.isRoleKnown = _this.data.playerList[playerObj.seatId].isRoleKnown;
				} catch (e) {
					//失败说明游戏刚开始，这是第一轮操作。那身份就必然都还是未知。这里啥也不用做。捕获这个异常就行了。
				}
			}
			if (playerObj.isRoleKnown) {
				playerObj.roleName_zh = _this.data.roles[Number(playerObj.role)].name_zh;
			} else {
				playerObj.roleName_zh = _this.data.roles[0].name_zh;
			}

			// //把已建造的（建筑牌id）映射成建筑牌对象
			// var handCardObjs = [];
			// playerObj.handCards.forEach(function (cardId, _, __) {
			// 	handCardObjs.push(_this.data.staticBuildingDict[v_card]);
			// })
			// playerObj.handCardObjs = handCardObjs;

			//判断游戏是否已经开局，因为开局后才会分配seatId
			if (playerObj.seatId !== null) {
				playerList[playerObj.seatId] = playerObj;
			} else {
				playerList.push(playerObj);
			}
		}


		// //遍历 knownRolePlayers，亮出相应玩家的身份
		// //这里不需要判断是否已开局，因为没开局时，该list为空
		// var knownRolePlayers = _this.data.knownRolePlayers;
		// knownRolePlayers.forEach(function (seatId, _, __) {
		// 	playerList[seatId].roleName_zh = _this.data.roles[Number(playerList[seatId].role)].name_zh;
		// })
		// 	// playerObj.roleName_zh = _this.data.roles[Number(playerObj.role)].name_zh;

		//把我的手牌（建筑牌id）映射成建筑牌对象
		var handCardObjs = [];
		playerDict[app.globalData.uid].handCards.forEach(function (cardId, _, __) {
			handCardObjs.push(_this.data.staticBuildingDict[cardId]);
		})

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
			playerList: playerList,
			roomMemberCnt: playerList.length,
			handCards: handCardObjs
		})
		console.log(playerList);
	},

	enterRoom: function (options) {
		var _this = this;
		var roomId = Number(options.roomId);
		var passwd = options.passwd;
		//保存房间号和房间密码到app全局变量中，便于掉线重连
		app.globalData.roomId = roomId;
		app.globalData.passwd = passwd;

		if (!app.globalData.disconnected) {
			//若这是首次连接，而非断线重连，则增加对各种pomelo.on的监听
			_this.pomeloAddListeners();
		}

		pomelo.init({
			host: app.globalData.conn_host,	//connector的host和port
			port: app.globalData.conn_port,
			// port: '/conn/', //小程序不允许带端口号，只能用默认443.所以这里通过目录，在服务器上用nginx反向代理实现将请求转发到不同端口上。
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



			pomelo.request(route, enterRoomParam, function (data) {
				//先将用户主动断开连接的标记置否
				_this.setData({
					userForceDisconnect: false
				});
				//若本次是断线后重连的
				if (app.globalData.disconnected) {
					_this.setData({
						gameOn: true
					})
				}


				if (data.retmsg.code === consts.ENTER_ROOM.OK) {
					console.log(data);
					_this.setData({
						roomMemberMax: data.retmsg.roomMemberMax
					})
					wx.setNavigationBarTitle({
						title: `房间 ${options.roomId} (${_this.data.roomMemberCnt}/${_this.data.roomMemberMax})`,
					})

					// if (!app.globalData.disconnected) {
					// 	//若这是首次连接，而非断线重连，则增加对各种pomelo.on的监听
					// 	_this.pomeloAddListeners();
					// }
					//标记一下，当前连上了（用于断线重连相关逻辑）
					app.globalData.disconnected = false;
					// }
					// else if (app.globalData.disconnected === true) {
					// 	_this.ask4Reconnect();
				} else {
					app.globalData.errorCode = data.retmsg.code;
					wx.navigateBack({
						//url: '../index/index?code=' + data.retmsg.code,
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

	pickRole: function (e) {
		var _this = this;
		console.log(e);
		var roleId = Number(e.currentTarget.dataset.roleId);
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
			roleId: this.data.roleIdPicked,
			seatId: this.data.mySeatNum
		}
		pomelo.request("core.coreHandler.pickRole", msg, null);//null指不传入callback，单向通知服务器。
		//发出请求后，只保留已选角色的按钮亮，但移除bindtap事件，其他的都disable
		this.setData({
			mePickingRole: false,
			myRoleId: this.data.roleIdPicked
		})
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
			gameOn: true,
			curState: consts.GAME_STATE.ROLE_PICKING
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
			_this.setData({
				mePickingRole: true,
				myRoleId: null,
				roleIdPicked: null
			})
		} else {
			//当前该其他玩家行动
			//弹出toptip说明当前谁在行动

			console.log(`curPlayer: ${curPlayer}, mySeat: ${_this.data.mySeatNum}`);
			// var curPlayerName = _this.data.playerList[curPlayer].wxNickName;
			// // _this.showError('请等待玩家 ' + curPlayerName + ' 选角色...');
			// _this.showNews('请等待玩家 ' + curPlayerName + ' 选角色...');
		}
		var curPlayerName = _this.data.playerList[curPlayer].wxNickName;
		// _this.showError('请等待玩家 ' + curPlayerName + ' 选角色...');
		_this.showNews('请等待玩家 ' + curPlayerName + ' 选角色...');
	},

	onTakingAction(msg) {
		var _this = this;
		var curPlayer = msg.curPlayer;
		console.log(`curPlayer: ${curPlayer}, _this.data.curPlayer: ${_this.data.curPlayer}`);
		console.log(`_this.data.curState: ${_this.data.curState} === ${consts.GAME_STATE.ROLE_PICKING}`);
		//先判断是不是进入下一个玩家的回合了
		// if (curPlayer !== _this.data.curPlayer || _this.data.curState === consts.GAME_STATE.ROLE_PICKING){
		// 	_this.data.curState = consts.GAME_STATE.COIN_OR_CARD;
		// 	console.log("??????");
		// 	//当前玩家变了，说明进入下一个人的回合了，那就把他的身份亮出来
		// 	// var knownRolePlayers = _this.data.knownRolePlayers;
		// 	// knownRolePlayers.push(curPlayer);
		// 	// _this.setData({
		// 	// 	knownRolePlayers: knownRolePlayers
		// 	// })
		// 	// console.log(knownRolePlayers);

		// }
		if (curPlayer !== _this.data.curPlayer) {
			_this.setData({
				[`playerList[${Number(curPlayer)}].isRoleKnown`]: true,
				[`playerList[${Number(curPlayer)}].roleName_zh`]: _this.data.roles[Number(msg.roleId)].name_zh
			})
		}

		_this.setData({
			curPlayer: curPlayer,
			// [`playerList[${curPlayer}].roleName_zh`]: _this.data.roles[Number(msg.roleId)].name_zh
		})
		console.log(_this.data.roles[Number(msg.roleId)].name_zh);
		if (curPlayer === _this.data.mySeatNum) {
			//当前该我行动
			if (_this.data.roles[msg.roleId].hasActiveAbility) {
				_this.setData({
					roleAbilityUsable: true
				})
			} else {
				_this.setData({
					roleAbilityUsable: false
				})
			}
			var canTakeTax = false;
			if (msg.roleId === consts.ROLES.KING || msg.roleId === consts.ROLES.BISHOP || msg.roleId === consts.ROLES.MERCHANT || msg.roleId === consts.ROLES.WARLORD) {
				canTakeTax = true;
			}

			var playerObj = _this.data.playerList[_this.data.mySeatNum];
			var iHaveSmithy = false;
			if (playerObj.buildingDict.hasOwnProperty(consts.BUILDINGS.SMITHY)) {
				iHaveSmithy = true;
			}
			var iHaveLab = false;
			if (playerObj.buildingDict.hasOwnProperty(consts.BUILDINGS.LABORATORY)) {
				iHaveLab = true;
			}

			_this.setData({
				myRoundNow: true,
				meTakingCoinOrCard: true,
				canTakeTax: canTakeTax,
				iHaveSmithy: iHaveSmithy,
				iHaveLab: iHaveLab
			})
			//弹出可进行的操作
			var actionList = [];

			var takeCoinsAction = {
				content: `拿取 ${msg.canTakeCoinCnt} 枚金币`,
				actionId: consts.MOVE.TAKE_COINS
			}
			var takeCardsAction = {
				content: `摸 ${msg.canTakeCardCnt} 张建筑牌，保留 ${msg.canHaveCardCnt} 张`,
				actionId: consts.MOVE.TAKE_BUILDING_CARDS
			}
			actionList[0] = takeCoinsAction;
			actionList[1] = takeCardsAction;
			_this.setData({
				myRoundNow: true,
				actionList: actionList,
				pickableCardCnt: msg.canHaveCardCnt
			})
			_this.switchToTab('move');
		} else {
			//当前该其他玩家行动
			//弹出toptip说明当前谁在行动

			// console.log(`curPlayer: ${curPlayer}, mySeat: ${_this.data.mySeatNum}`);
			// var curPlayerName = _this.data.playerList[curPlayer].wxNickName;
			// _this.showError('请等待玩家 ' + curPlayerName + ' 行动...');
		}
		console.log(`curPlayer: ${curPlayer}, mySeat: ${_this.data.mySeatNum}`);
		var curPlayerObj = _this.data.playerList[curPlayer];
		var curPlayerName = curPlayerObj.wxNickName;
		_this.showNews(`请等待  ${curPlayerObj.roleName_zh}（${curPlayerName}）行动...`);
	},

	takeCoinsOrCards: function (e) {
		var _this = this;
		var move = e.currentTarget.dataset.actionId;
		var msg = {
			move: move
		}
		pomelo.request("core.coreHandler.takeCoinsOrBuildingCards", msg, function (msg) {
			var cardList = [];
			//如果有返回，就是返回了候选建筑牌列表
			if (!!msg.candidates) {
				//弹出候选建筑牌
				_this.setData({
					mePickingBuildingCard: true
				})
				//把候选建筑牌（建筑牌id）映射成建筑牌对象
				msg.candidates.forEach(function (cardId, _, __) {
					var card = _this.data.staticBuildingDict[cardId];
					var cardInList = {
						content: `${card.cost}费 ${card.color}色 ${card.name}`,
						cardId: cardId
					}
					cardList.push(cardInList);
				})
			}
			_this.setData({
				candidateCardList: cardList
			})
		});
		/**
		 * 拿完金币或建筑牌，就可以开始进行建造了
		 */
		var buildChance;
		if (this.data.myRoleId == consts.ROLES.ARCHITECT) {
			buildChance = 3
		} else {
			buildChance = 1
		}
		_this.setData({
			meTakingCoinOrCard: false,
			// canBuild: true,
			buildChance: buildChance
		})
	},

	pickThisCard2MyHandcards: function (e) {
		var _this = this;
		var index = e.currentTarget.dataset.index;
		var pickableCardCnt = _this.data.pickableCardCnt;
		// var pickedList = _this.data.pickedList;
		//标记当前事件对应的牌为已选
		_this.setData({
			[`candidateCardList[${index}].picked`]: true,
			pickableCardCnt: pickableCardCnt - 1
		})

		//判断当前是否已经选完要加入手牌的建筑牌
		if (_this.data.pickableCardCnt === 0) {
			//已选完，那就把 pickedList 和 notPickedList 都塞进 msg 发给服务器
			var pickedList = [];
			var notPickedList = [];
			_this.data.candidateCardList.forEach((cardInList, _, __) => {
				if (cardInList.picked) {
					pickedList.push(cardInList.cardId);
				} else {
					notPickedList.push(cardInList.cardId);
				}
			})
			var msg = {
				pickedList: pickedList,
				notPickedList: notPickedList
			}
			pomelo.request("core.coreHandler.pickBuildingCard", msg, null);//null指不传入callback，单向通知服务器。
			//标记状态：我选完加入手牌的牌了
			_this.setData({
				mePickingBuildingCard: false
			})
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

	/**
	 * 开始建造建筑，切到手牌页，并enable每个建筑的按钮事件
	 */
	beginBuild() {
		var _this = this;
		var meDoingBuild = true;
		_this.setData({
			meDoingBuild: true
		})
		this.switchToTab('hand');
	},

	/**
	 * 建这个建筑。
	 * 判断手头金币是否足够建造，若不够则报错；
	 * 判断自己场上是否已有相同建筑，若有则报错，若无，则向服务器发请求。
	 */
	buildChosenBuilding(e) {
		var cardId = e.currentTarget.dataset.cardId;
		var myPlayerObj = this.data.playerList[this.data.mySeatNum];
		// console.log(myPlayerObj);

		if (myPlayerObj.coins < this.data.staticBuildingDict[cardId].cost) {
			//钱不够
			this.showError('金币不足，建造失败。');
			return;
		}

		if (!myPlayerObj.buildingDict.hasOwnProperty(cardId)) {
			//该建筑不在我的已有建筑中
			pomelo.request("core.coreHandler.build", {
				cardId: cardId
			}, null);
			this.checkIfCanBuildMore();
			this.switchToTab('move');
		} else {
			//我已拥有相同建筑
			this.showError('已拥有相同建筑，建造失败。')
		}
	},

	/**
	 * 判断是否还可以继续建造。
	 * 如果是建筑师，则有三个名额；如果不是，则只有一个名额。
	 */
	checkIfCanBuildMore() {
		this.setData({
			buildChance: this.data.buildChance - 1
		})

		// if (this.data.buildChance <= 0){
		// 	//已经没有继续建造的机会了
		// 	this.setData({
		// 		canBuild: false
		// 	})
		// }
	},

	/**
	 * 角色主动技能们
	 */
	assassin() {
		/**
		 * 刺杀。
		 * 目标可以是任何角色。
		 * 
		 * 弹出按钮列表
		 */
		var _this = this;
		_this.setData({
			showBottomPopup: true
		})
	},

	/**
	 * 根据我的不同身份，确定不同的技能
	 */
	actuallyUseAbilityOnRole(e) {
		var _this = this;
		console.log('picker发送选择改变，携带值为', e.detail.value)
		var targetRoleId = Number(e.detail.value) + 1;
		var ret;
		if (_this.data.myRoleId === consts.ROLES.ASSASSIN) {
			ret = _this.doKill(targetRoleId);
		} else if (_this.data.myRoleId === consts.ROLES.THIEF) {
			ret = _this.doSteal(targetRoleId);
		}
		if (ret === consts.CLIENT_ONLY.ERROR.SUICIDE_NOT_ALLOWED) {
			console.log('请珍爱生命，不要自杀。');
			_this.showError('请珍爱生命，不要自杀。');
		} else if (ret === consts.CLIENT_ONLY.ERROR.INVALID_TARGET) {
			console.log('不能偷 刺客 和 被刺杀的角色。');
			_this.showError('不能偷 刺客 和 被刺杀的角色。');
		} else {
			_this.setData({
				roleAbilityUsable: false
			})
			return;
		}
		// this.setData({
		// 	index: e.detail.value
		// })
	},

	/**
	 * 对角色或系统使用技能。
	 * 如果是魔术师：
	 * 	magician()
	 * 如果是军阀：
	 *  warlord()
	 */
	useAbilityOnPlayerOrSys() {
		var _this = this;
		if (_this.data.myRoleId === consts.ROLES.MAGICIAN) {
			_this.magician();
		} else if (_this.data.myRoleId === consts.ROLES.WARLORD) {
			_this.warlord();
		}
	},

	/**
	 * 主动技能已经选好了目标玩家。
	 * 若我是魔术师，则要与他换牌
	 * 
	 * 若我是军阀，则要弹出acitonSheet选择他的已有建筑进行拆除
	 * 
	 */
	aTargetPlayerIsPicked(e) {
		var _this = this;
		console.log(e.currentTarget.dataset.seatId);
		var targetPlayerSeatId = e.currentTarget.dataset.seatId;
		if (this.data.myRoleId === consts.ROLES.MAGICIAN) {
			//魔术师
			//与该玩家换牌
			var msg = {
				targetSeatId: targetPlayerSeatId
			}
			pomelo.request("core.coreHandler.useAbility", msg, null);
			_this.setData({
				roleAbilityUsable: false,
				mePickingTargetPlayer: false
			})
		} else if (this.data.myRoleId === consts.ROLES.WARLORD) {
			//军阀

			//给 buildingList4Picking2Demolish 赋值
			var targetPlayer = this.data.playerList[targetPlayerSeatId];
			// var buildingList4Picking2Demolish = targetPlayer.buildingList;
			_this.setData({
				pickingBuilding2demolish: true,
				buildingList4Picking2Demolish: targetPlayer.buildingList,
				targetPlayerSeatId: targetPlayerSeatId
			})
			//切到行动页
			_this.switchToTab('move');


			// //弹actionSheet，内容为当前玩家的已有建筑
			// var actionSheetList = [];
			// var targetPlayer = this.data.playerList[targetPlayerSeatId];
			// var buildingList = targetPlayer.buildingList;
			// buildingList.forEach((item, index) => {
			// 	actionSheetList[index] = `原价${item.cost}费 ${item.name}`;
			// })
			// wx.showActionSheet({
			// 	itemList: actionSheetList, //['A', 'B', 'C'],
			// 	success: function (res) {
			// 		if (!res.cancel) {
			// 			/**
			// 			 * 判断拆除的合法性：
			// 			 * 	1. 目标是否为主教
			// 			 * 	2. 目标建筑是否为堡垒
			// 			 * 	3. 目标玩家是否有长城
			// 			 *  4. 我的金币够不够用
			// 			 * 
			// 			 * 	5. 目标玩家是否已经造满了建筑
			// 			 */
			// 			// console.log(res.tapIndex)
			// 			var targetBuilding = buildingList[res.tapIndex];
			// 			var cost2Demolish = targetBuilding.cost - 1;
			// 			if (targetPlayer.role === consts.ROLES.BISHOP) {
			// 				_this.showError("不能拆主教的建筑！");
			// 			} else if (targetBuilding.id === consts.BUILDINGS.KEEP) {
			// 				_this.showError("不能拆堡垒！");
			// 			} else if (targetPlayer.buildingList.length >= consts.END_GAME.FULL_BUILDING) {
			// 				_this.showError(`对方已经完成${consts.END_GAME.FULL_BUILDING}个地区的建造，不能拆了。`);
			// 			} else {
			// 				if (targetPlayer.hasGreatWall) {
			// 					cost2Demolish += 1;
			// 				}
			// 				if (_this.data.playerList[_this.data.mySeatNum].coins >= cost2Demolish) {
			// 					//可以拆除，通知服务器
			// 					var msg = {
			// 						targetSeatId: targetPlayerSeatId,
			// 						targetBuilding: targetBuilding.id,
			// 						demolishCost: cost2Demolish
			// 					}
			// 					pomelo.request("core.coreHandler.useAbility", msg, null);
			// 					_this.setData({
			// 						roleAbilityUsable: false,
			// 						myRoundNow: false
			// 					})
			// 					_this.showNews("请等待 墓地 主人响应...");
			// 				} else {
			// 					_this.showError("金币不足，拆不起。");
			// 				}
			// 			}


			// 		}
			// 	}
			// });
		}
	},

	doDemolish(e) {
		/**
								 * 判断拆除的合法性：
								 * 	1. 目标是否为主教
								 * 	2. 目标建筑是否为堡垒
								 * 	3. 目标玩家是否有长城
								 *  4. 我的金币够不够用
								 * 
								 * 	5. 目标玩家是否已经造满了建筑
								 */
		var _this = this;
		var cardId = e.currentTarget.dataset.cardId;
		console.log(e);

		var targetPlayer = this.data.playerList[this.data.targetPlayerSeatId];
		// var buildingList = targetPlayer.buildingList;
		var targetBuilding = this.data.staticBuildingDict[cardId];
		console.log(targetBuilding);
		var cost2Demolish = targetBuilding.cost - 1;
		if (targetPlayer.role === consts.ROLES.BISHOP) {
			_this.showError("不能拆主教的建筑！");
		} else if (targetBuilding.id === consts.BUILDINGS.KEEP) {
			_this.showError("不能拆堡垒！");
		} else if (targetPlayer.buildingList.length >= consts.END_GAME.FULL_BUILDING) {
			_this.showError(`对方已经完成${consts.END_GAME.FULL_BUILDING}个地区的建造，不能拆了。`);
		} else {
			if (targetPlayer.hasGreatWall) {
				cost2Demolish += 1;
			}
			if (_this.data.playerList[_this.data.mySeatNum].coins >= cost2Demolish) {
				//可以拆除，通知服务器
				var msg = {
					targetSeatId: this.data.targetPlayerSeatId,
					targetBuilding: targetBuilding.id,
					demolishCost: cost2Demolish
				}
				console.log(msg);
				pomelo.request("core.coreHandler.useAbility", msg, null);
				_this.setData({
					roleAbilityUsable: false,
					myRoundNow: false,
					pickingBuilding2demolish: false,
					mePickingTargetPlayer: false
				})
				_this.showNews("请等待 墓地 主人响应...");
			} else {
				_this.showError("金币不足，拆不起。");
			}
		}
	},

	cancelDemolish() {
		this.setData({
			pickingBuilding2demolish: false,
			mePickingTargetPlayer: false
		})
	},

	doKill(targetRoleId) {
		// var targetRoleId = e.currentTarget.dataset.roleId;
		if (targetRoleId === consts.ROLES.ASSASSIN) {
			return consts.CLIENT_ONLY.ERROR.SUICIDE_NOT_ALLOWED;
		}
		var msg = {
			targetRoleId: targetRoleId
		}
		pomelo.request("core.coreHandler.useAbility", msg, null);
	},

	thief() {
		/**
		 * 偷取金币。
		 * 目标角色：不能是刺客和killed。
		 */
		var _this = this;
		_this.setData({
			showBottomPopup: true
		})
	},

	doSteal(targetRoleId) {
		if (targetRoleId === consts.ROLES.ASSASSIN) {
			return consts.CLIENT_ONLY.ERROR.INVALID_TARGET;
		} else if (targetRoleId === this.data.roleIdKilled) {
			return consts.CLIENT_ONLY.ERROR.INVALID_TARGET;
		}
		var msg = {
			targetRoleId: targetRoleId
		}
		pomelo.request("core.coreHandler.useAbility", msg, null);
	},

	/**
	 * 先弹窗问 跟玩家交换还是跟牌堆交换
	 */
	magician() {
		var _this = this;
		wx.showActionSheet({
			itemList: ['与玩家换牌', '与牌堆换牌'],
			success: function (res) {
				if (!res.cancel) {
					// console.log(res.tapIndex)
					if (res.tapIndex === 0) {
						//跟玩家换牌
						/**
						 * 切回局势页，选择玩家
						 */
						_this.setData({
							mePickingTargetPlayer: true
						})

						_this.switchToTab('situation');

					} else {
						//跟系统牌堆换牌
						/**
						 * 切到手牌页，多选手牌，最终确定选的牌
						 */
						var checkBoxList = [];
						_this.data.handCards.forEach((card, index, __) => {
							var item = {
								value: index, //card.id,
								name: `${card.cost}费 ${card.color}色 ${card.name}`,
								checked: false
							}
							checkBoxList.push(item);
						})
						console.log(checkBoxList);
						_this.setData({
							handCardsCheckBoxList: checkBoxList,
							magicianExchangingWithSys: true
						})
						_this.switchToTab('hand');
					}
				}
			}
		});
	},

	confirmExchangingWithSys() {
		var discardCards = [];
		this.data.handCardsCheckBoxList.forEach((item) => {
			if (item.checked) {
				//item.value表示的是当前这张牌在handCards中的index
				console.log(this.data.handCards[item.value].id);
				discardCards.push(this.data.handCards[item.value].id);
			}
		})
		var msg = {
			discardCards: discardCards
		}
		pomelo.request("core.coreHandler.useAbility", msg, null);
		this.setData({
			magicianExchangingWithSys: false,
			roleAbilityUsable: false
		})
	},

	cancelExchangingWithSys() {
		this.setData({
			magicianExchangingWithSys: false
		})
	},

	warlord() {
		var _this = this;
		/**
		* 切回局势页，选择玩家
		*/
		_this.setData({
			mePickingTargetPlayer: true
		})

		_this.switchToTab('situation');
	},


	/**
	 * 铁匠铺主动技能
	 * 支付2金币，摸3张牌.
	 * 判断是否有足够的金币。
	 */
	smithy() {
		if (this.data.playerList[this.data.mySeatNum].coins >= 2) {
			//若金币够用
			pomelo.request("core.coreHandler.smithy", {}, null);
		} else {
			this.showError("金币不足，无法发动技能。");
		}
		this.setData({
			iHaveSmithy: false
		})
	},

	/**
	 * 实验室主动技能
	 * 丢弃1手牌，获得1金币。
	//  * 判断是否有足够的手牌，若有至少1张，则：
	//  * 	直接弹出actionSheet。
		【2018-3-23】直接不判断手牌数量了，直接切到手牌页。对手牌按钮重新绑定tap事件。
	 */
	laboratory() {
		// var _this = this;
		// var handCards = this.data.handCards;
		// if (handCards.length >= 1) {
		// 	//弹actionSheet，内容为我的已有建筑

		// 	var actionSheetList = [];
		// 	handCards.forEach((item, index) => {
		// 		actionSheetList[index] = `原价${item.cost}费 ${item.name}`;
		// 	})
		// 	wx.showActionSheet({
		// 		itemList: actionSheetList,
		// 		success: function (res) {
		// 			if (!res.cancel) {
		// 				// console.log(res);
		// 				// console.log(res.tapIndex)
		// 				var msg = {
		// 					cardId: handCards[res.tapIndex].id
		// 				}
		// 				pomelo.request("core.coreHandler.laboratory", msg, null);
		// 				_this.setData({
		// 					iHaveLab: false
		// 				})
		// 			}
		// 		}
		// 	});
		// } else {
		// 	this.showError("你没手牌啦，不能发动技能啦！");
		// 	this.setData({
		// 		iHaveLab: false
		// 	})
		// }

		this.setData({
			laboratoryDiscardingCards: true
		})
		this.switchToTab('hand');

	},

	/**
	 * 丢弃此手牌，换取1金币
	 */
	labDiscardCard(e) {
		var cardId = e.currentTarget.dataset.cardId;
		var msg = {
			cardId: cardId
		}
		pomelo.request("core.coreHandler.laboratory", msg, null);
		this.setData({
			iHaveLab: false,
			laboratoryDiscardingCards: false
		})
	},

	cancelLabDiscard() {
		this.setData({
			laboratoryDiscardingCards: false
		})
		this.switchToTab('move');
	},

	/**
	 * 收税
	 */
	collectTax() {
		pomelo.request("core.coreHandler.collectTaxes", {}, null);
		this.setData({
			canTakeTax: false
		})
	},

	/**
	 * 墓地主人，回收拆除的卡
	 * 判断我的金币够不够1个
	 */
	recycle() {
		if (this.data.playerList[this.data.mySeatNum].coins >= 1) {
			pomelo.request("core.coreHandler.recycle", {
				recycle: true,
				cardId: cemeteryCard.id
			}, null);
		} else {
			this.showError("金币不足，回收不起啊");
		}
		this.setData({
			myRoundNow: false,
			cemeteryCard: null
		})
	},

	/**
	 * 墓地主人，拒绝回收
	 */
	notRecycle() {
		pomelo.request("core.coreHandler.recycle", {
			recycle: false
		}, null);
		this.setData({
			myRoundNow: false,
			cemeteryCard: null
		})
	},

	endMyRound() {
		var _this = this;
		pomelo.request("core.coreHandler.endRound", {}, null);
		_this.setData({
			myRoundNow: false
		})
		_this.switchToTab('situation');
	},

	/**
	 * 下面是ZanUI相关的
	 */

	handleZanTabChange(e) {
		var componentId = e.componentId;
		var selectedId = e.selectedId;
		// console.log(selectedId);
		if (selectedId !== 'help') {
			//点的不是帮助页
			this.setData({
				[`${componentId}.selectedId`]: selectedId
			});
		} else {
			//点了帮助页，那就调到单独的页面里
			wx.navigateTo({
				url: '../help/help'
			})
		}
	},

	handleZanSelectChange({ componentId, value }) {
		this.setData({
			[`checked.${componentId}`]: value
		});
	},

	checkboxChange: function (e) {
		console.log('checkbox发生change事件，携带value值为：', e.detail.value);

		var checkboxItems = this.data.handCardsCheckBoxList, values = e.detail.value;
		for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
			checkboxItems[i].checked = false;

			for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
				if (checkboxItems[i].value == values[j]) {
					checkboxItems[i].checked = true;
					break;
				}
			}
		}

		this.setData({
			handCardsCheckBoxList: checkboxItems
		});
	},
}));