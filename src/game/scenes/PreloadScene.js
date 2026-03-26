import Phaser from "phaser";
import { createCharacterAnimations } from "../animations/createCharacterAnimations";

export class PreloadScene extends Phaser.Scene {
	constructor() {
		super("PreloadScene");
	}

	preload() {
		this.load.spritesheet(
			"player",
			"/assets/characters/player/Male Skin1.png",
			{
				frameWidth: 80,
				frameHeight: 64,
			},
		);

		this.load.spritesheet("bot", "/assets/characters/bot/Male Skin2.png", {
			frameWidth: 80,
			frameHeight: 64,
		});

		this.load.spritesheet("sword", "/assets/characters/weapon/Male Sword.png", {
			frameWidth: 80,
			frameHeight: 64,
		});

		this.load.spritesheet("active-guard", "/assets/effects/active-guard.png", {
			frameWidth: 80,
			frameHeight: 64,
		});

		this.load.spritesheet("floor-tiles", "/assets/stage/Floor Tiles2.png", {
			frameWidth: 32,
			frameHeight: 32,
		});

		//Bakgrunds assets
		this.load.image("bg-layer1", "/assets/stage/bg/bg_layer1.png");
		this.load.image("bg-layer2", "/assets/stage/bg/bg_layer2.png");
		this.load.image("bg-layer3", "/assets/stage/bg/bg_layer3.png");
		this.load.image("bg-layer4", "/assets/stage/bg/bg_layer4.png");
		this.load.image("bg-layer5", "/assets/stage/bg/bg_layer5.png");

		// Atmosfär assets
		this.load.image("cloud1", "/assets/stage/cloud1.png");
		this.load.image("cloud2", "/assets/stage/cloud2.png");
		this.load.image("cloud3", "/assets/stage/cloud3.png");
		this.load.image("cloud6", "/assets/stage/cloud6.png");
		this.load.image("birds1", "/assets/stage/birds1.png");
		this.load.image("sun", "/assets/stage/sun.png");
	}

	create() {
		createCharacterAnimations(this, "player");
		createCharacterAnimations(this, "bot");

		const createSwordAnim = (key, frames, frameRate, repeat = 0) => {
			if (!this.anims.exists(key)) {
				this.anims.create({
					key,
					frames: frames.map((frame) => ({ key: "sword", frame })),
					frameRate,
					repeat,
				});
			}
		};

		if (!this.anims.exists("active-guard-loop")) {
			this.anims.create({
				key: "active-guard-loop",
				frames: this.anims.generateFrameNumbers("active-guard", {
					start: 0,
					end: 4,
				}),
				frameRate: 10,
				repeat: -1,
			});
		}

		createSwordAnim("sword-idle", [0, 1, 2, 3, 4], 8, -1);
		createSwordAnim("sword-run", [20, 21, 22, 23, 24, 25, 26, 27], 12, -1);
		createSwordAnim("sword-jump", [30, 31, 32, 33], 10, 0);
		createSwordAnim("sword-fall", [40, 41, 42, 43], 10, -1);
		createSwordAnim("sword-attack", [50, 51, 52, 53, 54, 55], 10, 0);
		createSwordAnim("sword-dash", [60, 61, 62, 63, 64, 65], 14, -1);
		createSwordAnim("sword-death", [66, 67, 68, 69], 8, 0);

		this.scene.start("FightScene");
	}
}
