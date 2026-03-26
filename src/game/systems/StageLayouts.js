import { settings } from "../data/settings";

export const TILE_SIZE = 32;
export const GROUND_Y = settings.gameHeight - 64;

export const stageLayout = {
	id: "forest-main",

	spawnPoints: {
		player: { x: 180, y: 500, facing: "right" },
		bot: { x: settings.gameWidth - 180, y: 500, facing: "left" },
	},

	ground: [
		{ xTiles: 0, widthTiles: 8 },
		{ xTiles: 12, widthTiles: 10 },
		{ xTiles: 27, widthTiles: 13 },
	],
	platforms: [
		{ xTiles: 8, y: 560, widthTiles: 4 },
		{ xTiles: 22, y: 560, widthTiles: 5 },
		{ xTiles: 14, y: 455, widthTiles: 6 },
		{ xTiles: 6, y: 360, widthTiles: 3 },
		{ xTiles: 28, y: 360, widthTiles: 3 },
	],

	sideWalls: {
		leftX: 16,
		rightX: settings.gameWidth - 16,
		width: 15,
		height: settings.gameHeight,
	},

	decorBack: [],
	decorMid: [],
	decorFront: [],
};
