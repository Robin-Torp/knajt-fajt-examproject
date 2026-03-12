import Phaser from "phaser";
import { Fighter } from "./Fighter";

export class Player extends Fighter {
	constructor(scene, x, y, config) {
		super(scene, x, y, config);

		this.keys = scene.input.keyboard.addKeys({
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D,
			jump: Phaser.Input.Keyboard.KeyCodes.W,
			attack: Phaser.Input.Keyboard.KeyCodes.SPACE,
		});
	}

	update() {
		if (this.isDead) return;

		if (this.keys.left.isDown) {
			this.moveLeft();
		} else if (this.keys.right.isDown) {
			this.moveRight();
		} else {
			this.stop();
		}

		if (Phaser.Input.Keyboard.JustDown(this.keys.jump)) {
			this.jump();
		}
	}

	wantsToAttack() {
		return Phaser.Input.Keyboard.JustDown(this.keys.attack);
	}
}
