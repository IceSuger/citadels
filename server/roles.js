roles=[
	//（颜色1~5表示皇家、宗教、商业、军事、特技）
	{
		name_zh="刺客", //中文名
		color=0, //0~5
		ability=abilities[1], //函数指针
		description="", //介绍
		wholePic="",    //原画
		avatar=""  //头像
		actionOrder=1, //行动顺序
		hasActiveAbility=true,   //bool
		//----上面是静态的，下面是随牌局和回合而变化的-----
		bannedAndShown=false, //bool 本回合选角色之前，系统随机选出被ban的角色并亮出
		bannedAndHidden=false, //bool 本回合选角色之前，系统随机选出被ban的角色并不亮出
		picked=false,  //bool 
		killed=false, //bool
		player=0,    //所属玩家（玩家编号从1开始）
		stolenBy=0 //被几号玩家所偷（也可以直接记为被偷，然后到自己回合时，查表中的二号角色所属玩家编号）
	},
	{
		name_zh="盗贼", //中文名
		color=0, //0~5
		ability=abilities[2], //函数指针
		description="", //介绍
		wholePic="",    //原画
		avatar=""  //头像
		actionOrder=1, //行动顺序
		hasActiveAbility=true,   //bool
		//----上面是静态的，下面是随牌局和回合而变化的-----
		bannedAndShown=false, //bool 本回合选角色之前，系统随机选出被ban的角色并亮出
		bannedAndHidden=false, //bool 本回合选角色之前，系统随机选出被ban的角色并不亮出
		picked=false,  //bool 
		killed=false, //bool
		player=0,    //所属玩家（玩家编号从1开始）
		stolenBy=0 //被几号玩家所偷（也可以直接记为被偷，然后到自己回合时，查表中的二号角色所属玩家编号）
	},
	{
		name_zh="魔术师", //中文名
		color=0, //0~5
		ability=abilities[3], //函数指针
		description="", //介绍
		wholePic="",    //原画
		avatar=""  //头像
		actionOrder=1, //行动顺序
		hasActiveAbility=true,   //bool
		//----上面是静态的，下面是随牌局和回合而变化的-----
		bannedAndShown=false, //bool 本回合选角色之前，系统随机选出被ban的角色并亮出
		bannedAndHidden=false, //bool 本回合选角色之前，系统随机选出被ban的角色并不亮出
		picked=false,  //bool 
		killed=false, //bool
		player=0,    //所属玩家（玩家编号从1开始）
		stolenBy=0 //被几号玩家所偷（也可以直接记为被偷，然后到自己回合时，查表中的二号角色所属玩家编号）
	},
	{
		name_zh="国王", //中文名
		color=1, //0~5
		ability=abilities[4], //函数指针
		description="", //介绍
		wholePic="",    //原画
		avatar=""  //头像
		actionOrder=1, //行动顺序
		hasActiveAbility=false,   //bool
		//----上面是静态的，下面是随牌局和回合而变化的-----
		bannedAndShown=false, //bool 本回合选角色之前，系统随机选出被ban的角色并亮出
		bannedAndHidden=false, //bool 本回合选角色之前，系统随机选出被ban的角色并不亮出
		picked=false,  //bool 
		killed=false, //bool
		player=0,    //所属玩家（玩家编号从1开始）
		stolenBy=0 //被几号玩家所偷（也可以直接记为被偷，然后到自己回合时，查表中的二号角色所属玩家编号）
	},
	{
		name_zh="主教", //中文名
		color=2, //0~5
		ability=abilities[5], //函数指针
		description="", //介绍
		wholePic="",    //原画
		avatar=""  //头像
		actionOrder=1, //行动顺序
		hasActiveAbility=false,   //bool
		//----上面是静态的，下面是随牌局和回合而变化的-----
		bannedAndShown=false, //bool 本回合选角色之前，系统随机选出被ban的角色并亮出
		bannedAndHidden=false, //bool 本回合选角色之前，系统随机选出被ban的角色并不亮出
		picked=false,  //bool 
		killed=false, //bool
		player=0,    //所属玩家（玩家编号从1开始）
		stolenBy=0 //被几号玩家所偷（也可以直接记为被偷，然后到自己回合时，查表中的二号角色所属玩家编号）
	},
	{
		name_zh="商人", //中文名
		color=3, //0~5
		ability=abilities[6], //函数指针
		description="", //介绍
		wholePic="",    //原画
		avatar=""  //头像
		actionOrder=1, //行动顺序
		hasActiveAbility=false,   //bool
		//----上面是静态的，下面是随牌局和回合而变化的-----
		bannedAndShown=false, //bool 本回合选角色之前，系统随机选出被ban的角色并亮出
		bannedAndHidden=false, //bool 本回合选角色之前，系统随机选出被ban的角色并不亮出
		picked=false,  //bool 
		killed=false, //bool
		player=0,    //所属玩家（玩家编号从1开始）
		stolenBy=0 //被几号玩家所偷（也可以直接记为被偷，然后到自己回合时，查表中的二号角色所属玩家编号）
	},
	{
		name_zh="建筑师", //中文名
		color=0, //0~5
		ability=abilities[7], //函数指针
		description="", //介绍
		wholePic="",    //原画
		avatar=""  //头像
		actionOrder=1, //行动顺序
		hasActiveAbility=false,   //bool
		//----上面是静态的，下面是随牌局和回合而变化的-----
		bannedAndShown=false, //bool 本回合选角色之前，系统随机选出被ban的角色并亮出
		bannedAndHidden=false, //bool 本回合选角色之前，系统随机选出被ban的角色并不亮出
		picked=false,  //bool 
		killed=false, //bool
		player=0,    //所属玩家（玩家编号从1开始）
		stolenBy=0 //被几号玩家所偷（也可以直接记为被偷，然后到自己回合时，查表中的二号角色所属玩家编号）
	},
	{
		name_zh="军阀", //中文名
		color=4, //0~5
		ability=abilities[8], //函数指针
		description="", //介绍
		wholePic="",    //原画
		avatar=""  //头像
		actionOrder=1, //行动顺序
		hasActiveAbility=true,   //bool
		//----上面是静态的，下面是随牌局和回合而变化的-----
		bannedAndShown=false, //bool 本回合选角色之前，系统随机选出被ban的角色并亮出
		bannedAndHidden=false, //bool 本回合选角色之前，系统随机选出被ban的角色并不亮出
		picked=false,  //bool 
		killed=false, //bool
		player=0,    //所属玩家（玩家编号从1开始）
		stolenBy=0 //被几号玩家所偷（也可以直接记为被偷，然后到自己回合时，查表中的二号角色所属玩家编号）
	}
]