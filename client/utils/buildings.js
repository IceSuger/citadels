/**
 * Created by X93 on 2018/2/18.
 */
var consts = require('./consts');

var buildings = [
	{
		id: consts.BUILDINGS.CASTLE,
		name: "城堡",
		cost: 4,
		color: consts.COLOR.GOLDEN,
		count: 4,
		special: false
	},
	{
		id: consts.BUILDINGS.MANOR,
		name: "庄园",
		cost: 3,
		color: consts.COLOR.GOLDEN,
		count: 5,
		special: false
	},
	{
		id: consts.BUILDINGS.PALACE,
		name: "宫殿",
		cost: 5,
		color: consts.COLOR.GOLDEN,
		count: 3,
		special: false
	},

	{
		id: consts.BUILDINGS.MARKET,
		name: "集市",
		cost: 2,
		color: consts.COLOR.GREEN,
		count: 4,
		special: false
	},
	{
		id: consts.BUILDINGS.TRADE_POST,
		name: "贸易栈",
		cost: 2,
		color: consts.COLOR.GREEN,
		count: 3,
		special: false
	},
	{
		id: consts.BUILDINGS.PUB,
		name: "酒馆",
		cost: 1,
		color: consts.COLOR.GREEN,
		count: 5,
		special: false
	},
	{
		id: consts.BUILDINGS.WHARF,
		name: "码头",
		cost: 3,
		color: consts.COLOR.GREEN,
		count: 3,
		special: false
	},
	{
		id: consts.BUILDINGS.HARBOUR,
		name: "港口",
		cost: 4,
		color: consts.COLOR.GREEN,
		count: 3,
		special: false
	},
	{
		id: consts.BUILDINGS.TOWN_HALL,
		name: "市政厅",
		cost: 5,
		color: consts.COLOR.GREEN,
		count: 2,
		special: false
	},

	{
		id: consts.BUILDINGS.CATHEDRAL,
		name: "大教堂",
		cost: 5,
		color: consts.COLOR.BLUE,
		count: 2,
		special: false
	},
	{
		id: consts.BUILDINGS.ABBEY,
		name: "修道院",
		cost: 3,
		color: consts.COLOR.BLUE,
		count: 3,
		special: false
	},
	{
		id: consts.BUILDINGS.CHURCH,
		name: "教堂",
		cost: 2,
		color: consts.COLOR.BLUE,
		count: 3,
		special: false
	},
	{
		id: consts.BUILDINGS.TEMPLE,
		name: "神庙",
		cost: 1,
		color: consts.COLOR.BLUE,
		count: 3,
		special: false
	},

	{
		id: consts.BUILDINGS.WATCHTOWER,
		name: "瞭望塔",
		cost: 1,
		color: consts.COLOR.RED,
		count: 3,
		special: false
	},
	{
		id: consts.BUILDINGS.PRISON,
		name: "监狱",
		cost: 2,
		color: consts.COLOR.RED,
		count: 3,
		special: false
	},
	{
		id: consts.BUILDINGS.FORTRESS,
		name: "要塞",
		cost: 5,
		color: consts.COLOR.RED,
		count: 2,
		special: false
	},
	{
		id: consts.BUILDINGS.BATTLEFIELD,
		name: "战场",
		cost: 3,
		color: consts.COLOR.RED,
		count: 3,
		special: false
	},


	{
		id: consts.BUILDINGS.LIBRARY,
		name: "图书馆",
		cost: 6,
		color: consts.COLOR.PURPLE,
		count: 1,
		special: true
	},
	{
		id: consts.BUILDINGS.DRAGON_GATE,
		name: "龙门",
		cost: 6,
		color: consts.COLOR.PURPLE,
		count: 1,
		special: true
	},
	{
		id: consts.BUILDINGS.CEMETERY,
		name: "墓地",
		cost: 5,
		color: consts.COLOR.PURPLE,
		count: 1,
		special: true
	},
	{
		id: consts.BUILDINGS.GHOST_TOWN,
		name: "鬼城",
		cost: 2,
		color: consts.COLOR.PURPLE,
		count: 1,
		special: true
	},
	{
		id: consts.BUILDINGS.MAGIC_SCHOOL,
		name: "佛法学校",
		cost: 6,
		color: consts.COLOR.PURPLE,
		count: 1,
		special: true
	},
	{
		id: consts.BUILDINGS.LABORATORY,
		name: "实验室",
		cost: 5,
		color: consts.COLOR.PURPLE,
		count: 1,
		special: true
	},
	{
		id: consts.BUILDINGS.SMITHY,
		name: "铁匠铺",
		cost: 5,
		color: consts.COLOR.PURPLE,
		count: 1,
		special: true
	},
	{
		id: consts.BUILDINGS.OBSERVATORY,
		name: "天文台",
		cost: 5,
		color: consts.COLOR.PURPLE,
		count: 1,
		special: true
	},
	{
		id: consts.BUILDINGS.COLLEGE,
		name: "大学",
		cost: 6,
		color: consts.COLOR.PURPLE,
		count: 1,
		special: true
	},
	{
		id: consts.BUILDINGS.KEEP,
		name: "堡垒",
		cost: 3,
		color: consts.COLOR.PURPLE,
		count: 2,
		special: true
	},
	{
		id: consts.BUILDINGS.GREAT_WALL,
		name: "长城",
		cost: 6,
		color: consts.COLOR.PURPLE,
		count: 1,
		special: true
	}
];



module.exports = buildings;