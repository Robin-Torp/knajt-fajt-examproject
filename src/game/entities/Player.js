import Phaser from "phaser";
import { Fighter } from "./Fighter";

export class Player extends Fighter {
	constructor(scene, x, y, config) {
		super(scene, x, y, config);

		this.keys = scene.input.keyboard.addKeys({
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D,
			jumpW: Phaser.Input.Keyboard.KeyCodes.W,
			jumpSpace: Phaser.Input.Keyboard.KeyCodes.SPACE,
			down: Phaser.Input.Keyboard.KeyCodes.S,
			attack: Phaser.Input.Keyboard.KeyCodes.J,
			guard: Phaser.Input.Keyboard.KeyCodes.SHIFT,
		});
	}

	update(time) {
		if (this.scene.isMatchStarting) {
			this.stop();
			return;
		}

		if (this.isDead) return;

		const leftDown = this.keys.left.isDown;
		const rightDown = this.keys.right.isDown;
		const downDown = this.keys.down.isDown;
		const guardDown = this.keys.guard.isDown;

		const jumpPressed =
			Phaser.Input.Keyboard.JustDown(this.keys.jumpW) ||
			Phaser.Input.Keyboard.JustDown(this.keys.jumpSpace);

		if (guardDown && Phaser.Input.Keyboard.JustDown(this.keys.left)) {
			const dashed = this.dash(-1);
			if (dashed) return;
		}

		if (guardDown && Phaser.Input.Keyboard.JustDown(this.keys.right)) {
			const dashed = this.dash(1);
			if (dashed) return;
		}

		if (guardDown && !leftDown && !rightDown) {
			this.startGuard();
			this.stop();
		} else {
			this.stopGuard();

			if (!this.isDashing) {
				if (leftDown) {
					this.moveLeft(time);
				} else if (rightDown) {
					this.moveRight(time);
				} else {
					this.stop();
				}
			}
		}

		if (jumpPressed) {
			const onGround = this.body.blocked.down;
			const touchingLeftWall = this.body.blocked.left;
			const touchingRightWall = this.body.blocked.right;

			if (downDown && onGround) {
				this.dropThroughPlatform();
				return;
			}

			if (!onGround && touchingLeftWall) {
				this.wallJump(1);
				return;
			}

			if (!onGround && touchingRightWall) {
				this.wallJump(-1);
				return;
			}

			this.jump();
		}

		if (downDown && !this.body.blocked.down) {
			this.fastFall();
		}
	}

	wantsToAttack() {
		if (this.isGuarding || this.isDashing || this.isDead || this.isAttacking) {
			return false;
		}

		return Phaser.Input.Keyboard.JustDown(this.keys.attack);
	}
}
