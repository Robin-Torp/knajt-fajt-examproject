import Phaser from "phaser";

export class Fighter extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, config) {
		super(scene, x, y, null);

		this.scene = scene;
		this.speed = config.speed;
		this.jumpForce = config.jumpForce;
		this.isDead = false;
		this.facing = "right";

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.setDisplaySize(40, 70);
		this.setTint(config.color);
		this.setCollideWorldBounds(true);
	}

	moveLeft() {
		if (this.isDead) return;
		this.setVelocityX(-this.speed);
		this.facing = "left";
	}

	moveRight() {
		if (this.isDead) return;
		this.setVelocityX(this.speed);
		this.facing = "right";
	}

	stop() {
		if (this.isDead) return;
		this.setVelocityX(0);
	}

	jump() {
		if (this.isDead) return;
		if (this.body.blocked.down) {
			this.setVelocityY(-this.jumpForce);
		}
	}

	die() {
		this.isDead = true;
		this.setVelocity(0, 0);
		this.setTint(0xffffff);
		this.setAlpha(0.5);
	}
}
