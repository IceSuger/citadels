// pages/game/game.js
var Zan = require('../../zanui/index');
const roleConfig = require('./roleConfig');
const consts = require('../../utils/consts');
const buildings = require('../../utils/buildings');
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
				title: '动作'
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
		meCanEndRound: false,
		//角色发动主动技能，选角色
		showBottomPopup: false,
		//本轮被杀的角色id，用于盗贼技能合法性判断
		roleIdKilled: null,

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
			role: roleConfig.roles[0]    //当前角色
		},
		roles: roleConfig.roles,
		roomId: null,

		playerList: [],
		roomMemberCnt: 0,
		roomMemberMax: 0,
		mySeatNum: null,
		myRoleId: null,
		curPlayer: null,

		playerReady: false,
		gameOn: false
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
			roomId: options.roomId
		})
		// wx.setNavigationBarTitle({
		// 	title: '房间 ' + options.roomId,
		// })
		//先注册监听房间成员变化的事件
		pomelo.on('roomMemberChange', function (msg) {
			// console.log('roomMemberChange' + msg);
			_this.updatePlayers(msg.playerDict);
			wx.setNavigationBarTitle({
				title: `房间 ${options.roomId} (${_this.data.roomMemberCnt}/${_this.data.roomMemberMax})`,
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
		this.enterRoom(options);
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

	gameStateChange(msg) {
		this.setData({
			curPlayer: null
		})
	},

	showCurMove(msg) {
		var _this = this;
		var curPlayer = msg.curPlayer;
		var curPlayerName = _this.data.playerList[curPlayer].wxNickName;
		if (msg.move === consts.MOVE.TAKE_BUILDING_CARDS) {
			_this.showError(curPlayerName + ' 正在拿取建筑牌...');
		}
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
		for (let uid in playerDict) {
			var playerObj = playerDict[uid];
			playerObj['buildingList'] = [];
			for (let building in playerObj['buildingDict']) {
				playerObj['buildingList'].push(playerObj['buildingDict'][building]);
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



			pomelo.request(route, enterRoomParam, function (data) {
				// if (data.error == 1) {
				// 	//提示房间已存在
				// 	//this.showZanTopTips('房间已存在');
				// 	return;
				// }
				if (data.retmsg.code === consts.ENTER_ROOM.OK) {
					console.log(data);
					_this.setData({
						roomMemberMax: data.retmsg.roomMemberMax
					})
					wx.setNavigationBarTitle({
						title: `房间 ${options.roomId} (${_this.data.roomMemberCnt}/${_this.data.roomMemberMax})`,
					})
					// _this.setData({
					// 	roomId: data.roomId
					// });
				}
				else {
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
				mePickingRole: true
			})
		} else {
			//当前该其他玩家行动
			//弹出toptip说明当前谁在行动

			console.log(`curPlayer: ${curPlayer}, mySeat: ${_this.data.mySeatNum}`);
			var curPlayerName = _this.data.playerList[curPlayer].wxNickName;
			_this.showError('请等待玩家 ' + curPlayerName + ' 选角色...');
		}

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
			//判断一下我有没有主动技能
			// if (msg.roleId === consts.ROLES.ASSASSIN){

			// }else if(msg.roleId === consts.ROLES.THIEF){

			// }else if(msg.roleId === consts.ROLES.MAGICIAN){

			// }else if(msg.roleId === consts.ROLES.WARLORD){

			// }
			if (_this.data.roles[msg.roleId].hasActiveAbility) {
				_this.setData({
					roleAbilityUsable: true
				})
			}

			_this.setData({
				meTakingCoinOrCard: true
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
				actionList: actionList,
				pickableCardCnt: msg.canHaveCardCnt
			})
			_this.switchToTab('move');
		} else {
			//当前该其他玩家行动
			//弹出toptip说明当前谁在行动

			console.log(`curPlayer: ${curPlayer}, mySeat: ${_this.data.mySeatNum}`);
			var curPlayerName = _this.data.playerList[curPlayer].wxNickName;
			_this.showError('请等待玩家 ' + curPlayerName + ' 行动...');
		}
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
		_this.setData({
			meCanEndRound: true,
			meTakingCoinOrCard: false
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
	 * 角色主动技能们
	 */
	ASSASSIN() {
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
	actuallyUseAbilityOnRole(e){
		var _this = this;
		console.log('picker发送选择改变，携带值为', e.detail.value)
		var targetRoleId = Number(e.detail.value) + 1;
		var ret;
		if(_this.data.myRoleId === consts.ROLES.ASSASSIN){
			ret = _this.doKill(targetRoleId);
		}else if(_this.data.myRoleId === consts.ROLES.THIEF){
			ret = _this.doSteal(targetRoleId);
		}
		if (ret === consts.CLIENT_ONLY.ERROR.INVALID_TARGET){
			console.log('请珍爱生命，不要自杀。');
			_this.showError('请珍爱生命，不要自杀。');
		} else if (ret === consts.CLIENT_ONLY.ERROR.INVALID_TARGET){
			console.log('不能偷 刺客 和 被刺杀的角色。');
			_this.showError('不能偷 刺客 和 被刺杀的角色。');
		}else{
			_this.setData({
				roleAbilityUsable: false
			})
			return;
		}
		// this.setData({
		// 	index: e.detail.value
		// })
	},

	doKill(targetRoleId) {
		// var targetRoleId = e.currentTarget.dataset.roleId;
		if(targetRoleId === consts.ROLES.ASSASSIN){
			return consts.CLIENT_ONLY.ERROR.INVALID_TARGET;
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

	doSteal(targetRoleId){
		if(targetRoleId === consts.ROLES.ASSASSIN){
			return consts.CLIENT_ONLY.ERROR.INVALID_TARGET;
		} else if (targetRoleId === this.data.roleIdKilled ){
			return consts.CLIENT_ONLY.ERROR.INVALID_TARGET;
		}
		var msg = {
			targetRoleId: targetRoleId
		}
		pomelo.request("core.coreHandler.useAbility", msg, null);
	},

	magician() {

	},

	warlord() {

	},


	/**
	 * 下面是ZanUI相关的
	 */

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