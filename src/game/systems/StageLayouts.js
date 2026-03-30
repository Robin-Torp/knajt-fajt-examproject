import { settings } from "../data/settings";

export const TILE_SIZE = 32;
export const GROUND_Y = settings.gameHeight - 64;

export const stageLayout = {
	id: "battlefield-lite",

	spawnPoints: {
		player: { x: 320, y: 500, facing: "right" },
		bot: { x: settings.gameWidth - 320, y: 500, facing: "left" },
	},

	ground: [{ xTiles: 5, widthTiles: 30 }],

	platforms: [
		// { xTiles: 8, y: 470, widthTiles: 5 },
		// { xTiles: 17, y: 410, widthTiles: 6 },
		// { xTiles: 27, y: 470, widthTiles: 5 },
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
