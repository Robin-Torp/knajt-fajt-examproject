import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { MenuScene } from "./scenes/MenuScene";
import { FightScene } from "./scenes/FightScene";
import { PauseScene } from "./scenes/PauseScene";
import { settings } from "./data/settings";

// Phaser-konfigurationen samlas här.
// Den beskriver bland annat storlek, fysik, DOM-stöd och vilka scener
// som ska startas i vilken ordning.

// Returnerar Phaser-konfigurationen. Funktionen tar parent så spelet kan mountas i rätt element.
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
