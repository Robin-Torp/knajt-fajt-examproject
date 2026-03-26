import { BootScene } from "./scenes/bootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { FightScene } from "./scenes/FightScene";
import { settings } from "./data/settings";

export const gameConfig = (parent) => ({
	type: Phaser.AUTO,
	width: settings.gameWidth,
	height: settings.gameHeight,
	parent,
	backgroundColor: "#1a1a1a",
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: settings.gravity },
			debug: false,
		},
	},
	scene: [BootScene, PreloadScene, FightScene],
});
