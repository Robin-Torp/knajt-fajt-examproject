import Phaser from "phaser";
import { settings } from "../data/settings";

export class Fighter extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, config) {
		super(scene, x, y, null);

		this.scene = scene;
		this.speed = config.speed;
		this.jumpForce = config.jumpForce;
		this.color = config.color;

		this.isDead = false;
		this.isGuarding = false;
		this.isDashing = false;
		this.canDash = true;
		this.hasIFrames = false;

		this.facing = "right";

		this.maxJumps = settings.maxJumps;
		this.jumpsRemaining = settings.maxJumps;

		this.wallJumpLockUntil = 0;
		this.wallJumpLockDirection = 0;

		this.ignorePlatformUntil = 0;

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.setDisplaySize(40, 70);
		this.setTint(this.color);
		this.setCollideWorldBounds(false);
	}

	preUpdate(time, delta) {
		super.preUpdate(time, delta);

		if (!this.body) return;

		if (this.body.blocked.down) {
			this.jumpsRemaining = this.maxJumps;

			if (settings.dashCooldownGroundOnly) {
				this.canDash = true;
			}
		}

		if (this.body.velocity.y > settings.maxFallSpeed) {
			this.setVelocityY(settings.maxFallSpeed);
		}
	}

	canMoveInDirection(direction, time) {
		if (
			time < this.wallJumpLockUntil &&
			direction === this.wallJumpLockDirection
		) {
			return false;
		}

		return true;
	}

	moveLeft(time = 0) {
		if (this.isDead || this.isDashing || this.isGuarding) return;
		if (!this.canMoveInDirection(-1, time)) return;

		this.setVelocityX(-this.speed);
		this.facing = "left";
	}

	moveRight(time = 0) {
		if (this.isDead || this.isDashing || this.isGuarding) return;
		if (!this.canMoveInDirection(1, time)) return;

		this.setVelocityX(this.speed);
		this.facing = "right";
	}

	stop() {
		if (this.isDead || this.isDashing) return;
		this.setVelocityX(0);
	}

	jump() {
		if (this.isDead || this.isDashing) return;

		if (this.body.blocked.down) {
			this.setVelocityY(-this.jumpForce);
			this.jumpsRemaining = this.maxJumps - 1;
			return;
		}

		if (this.jumpsRemaining > 0) {
			this.setVelocityY(-this.jumpForce);
			this.jumpsRemaining -= 1;
		}
	}

	wallJump(direction) {
		if (this.isDead || this.isDashing) return;

		this.setVelocityX(direction * settings.wallJumpX);
		this.setVelocityY(-settings.wallJumpY);
		this.facing = direction > 0 ? "right" : "left";

		this.wallJumpLockDirection = -direction;
		this.wallJumpLockUntil = this.scene.time.now + settings.wallJumpLockTime;

		this.jumpsRemaining = Math.max(0, this.jumpsRemaining - 1);
	}

	fastFall() {
		if (this.isDead || this.isDashing) return;
		if (this.body.blocked.down) return;

		if (this.body.velocity.y < settings.fastFallSpeed) {
			this.setVelocityY(settings.fastFallSpeed);
		}
	}

	dropThroughPlatform() {
		if (this.isDead || this.isDashing) return;

		this.ignorePlatformUntil = this.scene.time.now + 220;
		this.setVelocityY(Math.max(this.body.velocity.y, 160));
	}

	isIgnoringPlatforms(time) {
		return time < this.ignorePlatformUntil;
	}

	startGuard() {
		if (this.isDead || this.isDashing) return;
		this.isGuarding = true;
	}

	stopGuard() {
		this.isGuarding = false;
	}

	dash(direction) {
		if (this.isDead || this.isDashing || !this.canDash) return false;

		this.isDashing = true;
		this.canDash = false;
		this.isGuarding = false;
		this.hasIFrames = settings.dashIFrames;
		this.facing = direction < 0 ? "left" : "right";

		this.setVelocityX(direction * settings.dashSpeed);
		this.setVelocityY(0);
		this.setAlpha(0.7);

		this.scene.time.delayedCall(settings.dashDuration, () => {
			if (!this.body) return;

			this.isDashing = false;
			this.hasIFrames = false;
			this.setVelocityX(0);
			this.setAlpha(this.isDead ? 0.5 : 1);
		});

		return true;
	}

	die() {
		if (this.hasIFrames) return;

		this.isDead = true;
		this.isGuarding = false;
		this.isDashing = false;
		this.hasIFrames = false;

		this.setVelocity(0, 0);
		this.setTint(0xffffff);
		this.setAlpha(0.5);
	}

	resetState() {
		this.isDead = false;
		this.isGuarding = false;
		this.isDashing = false;
		this.canDash = true;
		this.hasIFrames = false;

		this.jumpsRemaining = this.maxJumps;
		this.wallJumpLockUntil = 0;
		this.wallJumpLockDirection = 0;
		this.ignorePlatformUntil = 0;

		this.setAlpha(1);
		this.setTint(this.color);
	}
}
