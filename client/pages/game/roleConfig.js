module.exports = {
	roles: [
		{
			name_zh: "——", //中文名
		},
		{
			name_zh: "刺客", //中文名
			color: 0, //0~5
			ability: 'assasin', //函数指针
			ability_zh: "刺杀",
			description: "", //介绍
			wholePic: "",    //原画
			avatar: "",  //头像
			actionOrder: 1, //行动顺序
			hasActiveAbility: true,   //bool
		},
		{
			name_zh: "盗贼", //中文名
			color: 0, //0~5
			ability: 'thief', //函数指针
			ability_zh: "偷取",
			description: "", //介绍
			wholePic: "",    //原画
			avatar: "",  //头像
			actionOrder: 1, //行动顺序
			hasActiveAbility: true,   //bool
		},
		{
			name_zh: "魔术师", //中文名
			color: 0, //0~5
			ability: 'magician', //函数指针
			ability_zh: "换牌",
			description: "", //介绍
			wholePic: "",    //原画
			avatar: "",  //头像
			actionOrder: 1, //行动顺序
			hasActiveAbility: true,   //bool
		},
		{
			name_zh: "国王", //中文名
			color: 1, //0~5
			ability: king, //函数指针
			description: "", //介绍
			wholePic: "",    //原画
			avatar: "",  //头像
			actionOrder: 1, //行动顺序
			hasActiveAbility: false,   //bool
		},
		{
			name_zh: "主教", //中文名
			color: 2, //0~5
			ability: bishop, //函数指针
			description: "", //介绍
			wholePic: "",    //原画
			avatar: "",  //头像
			actionOrder: 1, //行动顺序
			hasActiveAbility: false,   //bool
		},
		{
			name_zh: "商人", //中文名
			color: 3, //0~5
			ability: merchant, //函数指针
			description: "", //介绍
			wholePic: "",    //原画
			avatar: "",  //头像
			actionOrder: 1, //行动顺序
			hasActiveAbility: false,   //bool
		},
		{
			name_zh: "建筑师", //中文名
			color: 0, //0~5
			ability: architecture, //函数指针
			description: "", //介绍
			wholePic: "",    //原画
			avatar: "",  //头像
			actionOrder: 1, //行动顺序
			hasActiveAbility: false,   //bool
		},
		{
			name_zh: "军阀", //中文名
			color: 4, //0~5
			ability: 'warlord', //函数指针
			ability_zh: "摧毁",
			description: "", //介绍
			wholePic: "",    //原画
			avatar: "",  //头像
			actionOrder: 1, //行动顺序
			hasActiveAbility: true,   //bool
		},
	],
}

function assasin(args) {
	/**
		args={
			targetRole	//int,
		}
	*/
}

function thief(args) {
	/**
		args={
			targetRole	//int,
		}
	*/
}

function magician(args) {
	//主动技能二选一
	//主动1 换玩家手牌
	//主动2	扔自己手牌，从牌堆拿相等数量牌。此弃牌不进入弃牌堆，而是直接unshift到pile底部
	/**
		args={
			activeAbilityNumber	//int(1 or 2),表明使用哪个技能
			targetPlayer	//int,
		}
	*/
}

function king(args) {
	//被动下回合先选角色
}

function bishop(args) {
	//被动不会被【军阀的主动技能】拆建筑
	//但如果被刺杀了，就可以被拆建筑了
	//且可以被【军械库】拆建筑
}

function merchant(args) {
	//被动获得1金币
}

function architecture(args) {
	//被动:当回合开始可额外获得2建筑卡，无论选择拿钱还是拿卡
	//被动可建3建筑
}

function warlord(args) {
	/**
		args={
			targetRole	//int,
			buildingToDestroy	//string,
		}
	*/
}
