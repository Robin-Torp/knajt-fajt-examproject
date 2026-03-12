export class PreloadScene extends Phaser.Scene {
	constructor() {
		super("PreloadScene");
	}

	preload() {
		// Fixa sprites
	}

	create() {
		this.scene.start("FightScene");
	}
}
