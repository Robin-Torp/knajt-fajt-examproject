import Phaser from "phaser";
import { settings } from "../data/settings";

export class Fighter extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, config) {
		super(scene, x, y, config.texture);

		this.scene = scene;
		this.textureKey = config.texture;
		this.speed = config.speed;
		this.jumpForce = config.jumpForce;

		this.isDead = false;
		this.isGuarding = false;
		this.isDashing = false;
		this.isAttacking = false;
		this.isLaunched = false;
		this.isClashing = false;

		this.attackReadyAt = 0;
		this.hasIFrames = false;
		this.facing = "right";
		this.attackFacing = null;

		this.maxJumps = settings.maxJumps;
		this.jumpsRemaining = settings.maxJumps;

		this.wallJumpLockUntil = 0;
		this.wallJumpLockDirection = 0;
		this.ignorePlatformUntil = 0;

		this.attackDidHit = false;
		this.attackActive = false;

		this.canDash = true;
		this.dashReadyAt = 0;
		this.dashReadyBlinking = false;

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.setDisplaySize(120, 96);
		this.setCollideWorldBounds(false);
		this.setOrigin(0.5, 0.8);
		this.setDragX(0);

		this.body.setSize(18, 38);
		this.body.setOffset(31, 22);

		this.sword = scene.add.sprite(x, y, "sword");
		this.sword.setOrigin(0.5, 0.8);
		this.sword.setDepth(this.depth + 1);
		this.sword.setDisplaySize(120, 96);
		this.sword.setVisible(true);

		this.guardEffect = scene.add.sprite(x, y, "active-guard");
		this.guardEffect.setOrigin(0.5, 0.8);
		this.guardEffect.setDisplaySize(120, 96);
		this.guardEffect.setVisible(false);
		this.guardEffect.setDepth(this.depth + 2);

		this.attackHitbox = scene.add.rectangle(x, y, 42, 16, 0xff0000, 0);
		scene.physics.add.existing(this.attackHitbox);

		this.attackHitbox.body.allowGravity = false;
		this.attackHitbox.body.enable = false;
		this.attackHitbox.visible = false;

		this.nameTag = scene.add
			.text(x, y - 60, config.name || "", {
				fontSize: "14px",
				color: "#ffffff",
				backgroundColor: "#000000aa",
				padding: { x: 6, y: 2 },
			})
			.setOrigin(0.5);

		this.nameArrow = scene.add
			.text(x, y - 50, "▼", {
				fontSize: "13px",
				color: config.uiColor || "#ffffff",
			})
			.setOrigin(0.5);

		this.play(`${this.textureKey}-idle`);
	}

	preUpdate(time, delta) {
		super.preUpdate(time, delta);

		if (!this.body) return;

		if (this.nameTag) {
			this.nameTag.setPosition(this.x, this.y - 78);
		}

		if (this.nameArrow) {
			this.nameArrow.setPosition(this.x, this.y - 60);
		}

		if (this.body.blocked.down) {
			this.jumpsRemaining = this.maxJumps;
		}

		if (this.body.velocity.y > settings.maxFallSpeed) {
			this.setVelocityY(settings.maxFallSpeed);
		}

		if (!this.canDash && time >= this.dashReadyAt) {
			this.canDash = true;
			this.blinkDashReady();
		}

		if (this.isLaunched) {
			if (this.body.blocked.down) {
				this.setDragX(700);

				if (
					Math.abs(this.body.velocity.x) < 12 &&
					Math.abs(this.body.velocity.y) < 20
				) {
					this.setVelocity(0, 0);
					this.setBounce(0.2, 0.25);
					this.isLaunched = false;
					this.setDragX(0);
				}
			} else {
				this.setDragX(0);
			}
		}

		if (this.guardEffect) {
			this.guardEffect.setPosition(this.x, this.y);
			this.guardEffect.setFlipX(this.flipX);
		}

		this.updateAnimation();
		this.updateSword();
		this.updateAttackHitbox();
	}

	updateAnimation() {
		if (this.isDead) {
			this.playIfNeeded(`${this.textureKey}-death`);
			return;
		}

		if (this.isClashing) {
			this.playIfNeeded(`${this.textureKey}-fall`);
			return;
		}

		if (this.isAttacking) {
			this.playIfNeeded(`${this.textureKey}-attack`);
			return;
		}

		if (this.isDashing) {
			this.playIfNeeded(`${this.textureKey}-dash`);
			return;
		}

		if (this.isGuarding) {
			this.playIfNeeded(`${this.textureKey}-idle`);
			return;
		}

		if (!this.body.blocked.down) {
			if (this.body.velocity.y < 0) {
				this.playIfNeeded(`${this.textureKey}-jump`);
			} else {
				this.playIfNeeded(`${this.textureKey}-fall`);
			}
			return;
		}

		if (Math.abs(this.body.velocity.x) > 5) {
			this.playIfNeeded(`${this.textureKey}-run`);
			return;
		}

		this.playIfNeeded(`${this.textureKey}-idle`);
	}

	playIfNeeded(key) {
		if (this.anims.currentAnim?.key !== key) {
			this.play(key, true);
		}
	}

	faceTarget(target) {
		if (!target) return;

		if (this.isAttacking || this.isDashing || this.isClashing) {
			return;
		}

		if (target.x > this.x) {
			this.facing = "right";
			this.setFlipX(true);
		} else {
			this.facing = "left";
			this.setFlipX(false);
		}

		this.updateAttackHitbox();

		if (this.sword) {
			this.sword.setFlipX(this.flipX);
		}
	}

	updateSword() {
		if (!this.sword) return;

		this.sword.setPosition(this.x, this.y);
		this.sword.setFlipX(this.flipX);
		this.sword.setVisible(true);

		let swordAnim = "sword-idle";

		if (this.isDead) {
			swordAnim = "sword-death";
		} else if (this.isAttacking) {
			swordAnim = "sword-attack";
		} else if (this.isDashing) {
			swordAnim = "sword-dash";
		} else if (!this.body.blocked.down) {
			if (this.body.velocity.y < 0) {
				swordAnim = "sword-jump";
			} else {
				swordAnim = "sword-fall";
			}
		} else if (Math.abs(this.body.velocity.x) > 5) {
			swordAnim = "sword-run";
		}

		if (this.scene.anims.exists(swordAnim)) {
			if (this.sword.anims.currentAnim?.key !== swordAnim) {
				this.sword.play(swordAnim, true);
			}
		}
	}

	updateAttackHitbox() {
		if (!this.attackHitbox || !this.attackHitbox.body) return;

		const activeFacing =
			this.isAttacking && this.attackFacing ? this.attackFacing : this.facing;

		const offsetX = activeFacing === "right" ? 28 : -28;
		const offsetY = -8;

		this.attackHitbox.setPosition(this.x + offsetX, this.y + offsetY);
		this.attackHitbox.body.updateFromGameObject();

		if (!this.attackActive || !this.isAttacking || this.isDead) {
			this.attackHitbox.body.enable = false;
			this.attackHitbox.visible = false;
			return;
		}

		this.attackHitbox.body.enable = true;
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
		if (
			this.isDead ||
			this.isDashing ||
			this.isGuarding ||
			this.isAttacking ||
			this.isClashing
		) {
			return;
		}
		if (!this.canMoveInDirection(-1, time)) return;

		this.setVelocityX(-this.speed);
		this.setFlipX(false);
		this.facing = "left";
	}

	moveRight(time = 0) {
		if (
			this.isDead ||
			this.isDashing ||
			this.isGuarding ||
			this.isAttacking ||
			this.isClashing
		) {
			return;
		}
		if (!this.canMoveInDirection(1, time)) return;

		this.setVelocityX(this.speed);
		this.setFlipX(true);
		this.facing = "right";
	}

	stop() {
		if (this.isDead || this.isDashing || this.isClashing) return;

		if (this.isAttacking && this.body.blocked.down) {
			this.setVelocityX(this.body.velocity.x * 0.35);
			return;
		}

		this.setVelocityX(0);
	}

	jump() {
		if (
			this.isDead ||
			this.isDashing ||
			this.isClashing ||
			this.scene.matchDecided
		) {
			return;
		}

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
		if (
			this.isDead ||
			this.isDashing ||
			this.isClashing ||
			this.scene.matchDecided
		) {
			return;
		}

		this.setVelocityX(direction * settings.wallJumpX);
		this.setVelocityY(-settings.wallJumpY);
		this.setFlipX(direction > 0);
		this.facing = direction > 0 ? "right" : "left";

		this.wallJumpLockDirection = -direction;
		this.wallJumpLockUntil = this.scene.time.now + settings.wallJumpLockTime;

		this.jumpsRemaining = Math.max(0, this.jumpsRemaining - 1);
	}

	fastFall() {
		if (this.isDead || this.isDashing || this.isClashing) return;
		if (this.body.blocked.down) return;

		if (this.body.velocity.y < settings.fastFallSpeed) {
			this.setVelocityY(settings.fastFallSpeed);
		}
	}

	dropThroughPlatform() {
		if (
			this.isDead ||
			this.isDashing ||
			this.isClashing ||
			this.scene.matchDecided ||
			this.scene.isRespawning
		) {
			return;
		}

		this.ignorePlatformUntil = this.scene.time.now + 220;
		this.setVelocityY(Math.max(this.body.velocity.y, 160));
	}

	isIgnoringPlatforms(time) {
		return time < this.ignorePlatformUntil;
	}

	startGuard() {
		if (
			this.isDead ||
			this.isDashing ||
			this.isAttacking ||
			this.isClashing ||
			this.scene.matchDecided ||
			this.scene.isRespawning
		) {
			return;
		}

		this.isGuarding = true;
		this.setVelocityX(0);

		if (this.guardEffect) {
			this.guardEffect.setVisible(true);

			if (this.scene.anims.exists("active-guard-loop")) {
				this.guardEffect.play("active-guard-loop", true);
			}
		}
	}

	stopGuard() {
		this.isGuarding = false;

		if (this.guardEffect) {
			this.guardEffect.anims.stop();
			this.guardEffect.setFrame(0);
			this.guardEffect.setVisible(false);
		}
	}

	dash(direction) {
		if (
			this.isDead ||
			this.isDashing ||
			!this.canDash ||
			this.isAttacking ||
			this.isClashing ||
			this.scene.matchDecided ||
			this.scene.isRespawning
		) {
			return false;
		}

		this.isDashing = true;
		this.canDash = false;
		this.dashReadyAt = this.scene.time.now + settings.dashCooldown;
		this.isGuarding = false;
		this.hasIFrames = settings.dashIFrames;

		this.setFlipX(direction > 0);
		this.facing = direction < 0 ? "left" : "right";

		this.setVelocityX(direction * settings.dashSpeed);
		this.setVelocityY(0);
		this.setAlpha(0.6);

		this.scene.time.delayedCall(settings.dashDuration, () => {
			if (!this.body) return;

			this.isDashing = false;
			this.setVelocityX(0);

			this.scene.time.delayedCall(settings.dashIFrameExtra, () => {
				this.hasIFrames = false;
			});

			if (!this.isDead && !this.isGuarding) {
				this.setAlpha(1);
			}
		});

		return true;
	}

	blinkDashReady() {
		if (this.dashReadyBlinking || this.isDead) return;

		this.dashReadyBlinking = true;

		let flashes = 0;

		const flash = () => {
			if (this.isDead) {
				this.dashReadyBlinking = false;
				return;
			}

			this.setTintFill(0xffffff);
			if (this.sword) {
				this.sword.setTintFill(0xffffff);
			}

			this.scene.time.delayedCall(70, () => {
				this.clearTint();
				if (this.sword) {
					this.sword.clearTint();
				}

				flashes += 1;

				if (flashes < 3) {
					this.scene.time.delayedCall(70, flash);
				} else {
					this.dashReadyBlinking = false;
				}
			});
		};

		flash();
	}

	startAttack() {
		if (
			this.isDead ||
			this.isDashing ||
			this.isGuarding ||
			this.isAttacking ||
			this.isClashing ||
			this.scene.matchDecided ||
			this.scene.isRespawning
		) {
			return false;
		}

		if (this.scene.time.now < this.attackReadyAt) {
			return false;
		}

		this.attackReadyAt = this.scene.time.now + settings.attackCooldown;

		this.isAttacking = true;
		this.attackDidHit = false;
		this.attackActive = false;
		this.attackFacing = this.facing;
		this.setFlipX(this.attackFacing === "right");

		if (this.body.blocked.down) {
			this.setVelocityX(this.body.velocity.x * 0.35);
		}

		this.play(`${this.textureKey}-attack`, true);
		this.updateAttackHitbox();

		this.scene.time.delayedCall(180, () => {
			if (!this.isDead && this.isAttacking) {
				this.attackActive = true;
			}
		});

		this.scene.time.delayedCall(320, () => {
			this.attackActive = false;
		});

		this.scene.time.delayedCall(650, () => {
			this.isAttacking = false;
			this.attackActive = false;
			this.attackDidHit = false;
			this.attackFacing = null;

			if (this.attackHitbox?.body) {
				this.attackHitbox.body.enable = false;
			}

			if (this.attackHitbox) {
				this.attackHitbox.visible = false;
			}
		});

		return true;
	}

	launch(direction = 1, powerX = 340, powerY = 260) {
		this.isDead = true;
		this.isGuarding = false;
		this.isDashing = false;
		this.isAttacking = false;
		this.attackActive = false;
		this.hasIFrames = false;
		this.isLaunched = true;
		this.attackFacing = null;

		if (this.attackHitbox?.body) {
			this.attackHitbox.body.enable = false;
		}

		this.setVelocity(direction * powerX, -powerY);
		this.setBounce(0.5, 0.8);
	}

	clashPush(direction = 1) {
		this.isAttacking = false;
		this.attackActive = false;
		this.attackDidHit = true;
		this.isClashing = true;
		this.hasIFrames = true;
		this.attackFacing = null;

		if (this.attackHitbox?.body) {
			this.attackHitbox.body.enable = false;
		}

		this.setDragX(0);
		this.setBounce(0, 0);
		this.setVelocity(direction * 780, -180);

		this.scene.time.delayedCall(360, () => {
			this.isClashing = false;
			this.hasIFrames = false;
		});
	}

	die() {
		if (this.hasIFrames) return;

		if (this.nameTag) this.nameTag.setVisible(false);
		if (this.nameArrow) this.nameArrow.setVisible(false);

		this.isDead = true;
		this.isGuarding = false;
		this.isDashing = false;
		this.isAttacking = false;
		this.attackActive = false;
		this.hasIFrames = false;
		this.attackFacing = null;

		if (this.attackHitbox?.body) {
			this.attackHitbox.body.enable = false;
		}
		if (this.attackHitbox) {
			this.attackHitbox.visible = false;
		}

		if (this.guardEffect) {
			this.guardEffect.stop();
			this.guardEffect.setVisible(false);
		}

		this.setAlpha(0.5);
	}

	resetState() {
		this.isDead = false;
		this.isGuarding = false;
		this.isDashing = false;
		this.isAttacking = false;
		this.isLaunched = false;
		this.isClashing = false;

		this.attackActive = false;
		this.attackDidHit = false;
		this.attackFacing = null;

		this.canDash = true;
		this.hasIFrames = false;
		this.attackReadyAt = 0;
		this.dashReadyAt = 0;
		this.dashReadyBlinking = false;

		this.jumpsRemaining = this.maxJumps;
		this.wallJumpLockUntil = 0;
		this.wallJumpLockDirection = 0;
		this.ignorePlatformUntil = 0;

		if (this.attackHitbox?.body) {
			this.attackHitbox.body.enable = false;
		}
		if (this.attackHitbox) {
			this.attackHitbox.visible = false;
		}
		if (this.sword) {
			this.sword.setVisible(true);
			this.sword.setAlpha(1);
			this.sword.clearTint();
			this.sword.setFrame(0);
		}
		if (this.guardEffect) {
			this.guardEffect.stop();
			this.guardEffect.setVisible(false);
		}
		if (this.nameTag) this.nameTag.setVisible(true);
		if (this.nameArrow) this.nameArrow.setVisible(true);

		this.clearTint();
		this.setBounce(0, 0);
		this.setDragX(0);
		this.setAlpha(1);
	}
}
