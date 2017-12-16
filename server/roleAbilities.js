var abilities=[
	function nullRole(args){
		//占个位，从而保证后面的编号从1开始
	}
	function assasin(args){
		/**
			args={
				targetRole	//int,
			}
		*/
	},
	function thief(args){
		/**
			args={
				targetRole	//int,
			}
		*/
	},
	function magician(args){
		//主动技能二选一
		//主动1 换玩家手牌
		//主动2	扔自己手牌，从牌堆拿相等数量牌。此弃牌不进入弃牌堆，而是直接unshift到pile底部
		/**
			args={
				activeAbilityNumber	//int(1 or 2),表明使用哪个技能
				targetPlayer	//int,
			}
		*/
	},
	function king(args){
		//被动下回合先选角色
	},
	function bishop(args){
		//被动不会被【军阀的主动技能】拆建筑
		//但如果被刺杀了，就可以被拆建筑了
		//且可以被【军械库】拆建筑
	},
	function merchant(args){
		//被动获得1金币
	},
	function architecture(args){
		//被动:当回合开始可额外获得2建筑卡，无论选择拿钱还是拿卡
		//被动可建3建筑
	},
	function warlord(args){
		/**
			args={
				targetRole	//int,
				buildingToDestroy	//string,
			}
		*/
	},
];