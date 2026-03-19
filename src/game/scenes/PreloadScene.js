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
