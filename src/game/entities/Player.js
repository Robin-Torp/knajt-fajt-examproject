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
			guard: Phaser.Input.Keyboard.KeyCodes.K,
			dashModifier: Phaser.Input.Keyboard.KeyCodes.SHIFT,
		});

		this.requireMoveReleaseAfterGuard = false;
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
		const dashHeld = this.keys.dashModifier.isDown;

		const leftPressed = Phaser.Input.Keyboard.JustDown(this.keys.left);
		const rightPressed = Phaser.Input.Keyboard.JustDown(this.keys.right);
		const dashPressed = Phaser.Input.Keyboard.JustDown(this.keys.dashModifier);

		const jumpPressed =
			Phaser.Input.Keyboard.JustDown(this.keys.jumpW) ||
			Phaser.Input.Keyboard.JustDown(this.keys.jumpSpace);

		const wantsDashLeft =
			(dashHeld && leftPressed) || (dashPressed && leftDown && !rightDown);

		const wantsDashRight =
			(dashHeld && rightPressed) || (dashPressed && rightDown && !leftDown);

		if (wantsDashLeft) {
			const dashed = this.dash(-1);
			if (dashed) return;
		}

		if (wantsDashRight) {
			const dashed = this.dash(1);
			if (dashed) return;
		}

		// Guard ska kunna tryckas mitt i gång -> stanna direkt
		if (Phaser.Input.Keyboard.JustDown(this.keys.guard)) {
			this.requireMoveReleaseAfterGuard = true;
			this.startGuard();
			this.stop();
		}

		// När båda riktningarna släppts får man röra sig igen med ny input
		if (!leftDown && !rightDown) {
			this.requireMoveReleaseAfterGuard = false;
		}

		if (guardDown) {
			this.startGuard();
			this.stop();
		} else {
			this.stopGuard();

			if (!this.isDashing) {
				if (this.requireMoveReleaseAfterGuard) {
					this.stop();
				} else if (leftDown && !rightDown) {
					this.moveLeft(time);
				} else if (rightDown && !leftDown) {
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
