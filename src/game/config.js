import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { MenuScene } from "./scenes/MenuScene";
import { FightScene } from "./scenes/FightScene";
import { PauseScene } from "./scenes/PauseScene";
import { settings } from "./data/settings";

export const gameConfig = (parent) => ({
	type: Phaser.AUTO,
	width: settings.gameWidth,
	height: settings.gameHeight,
	parent,
	backgroundColor: "#1a1a1a",
	dom: {
		createContainer: true,
	},
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: settings.gravity },
			debug: false,
		},
	},
	scene: [BootScene, PreloadScene, MenuScene, FightScene, PauseScene],
});
