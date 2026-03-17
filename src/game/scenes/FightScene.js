import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Bot } from "../entities/Bot";
import { fighters } from "../data/fighters";
import { settings } from "../data/settings";
import { tryAttack } from "../systems/combat";

export class FightScene extends Phaser.Scene {
	constructor() {
		super("FightScene");
	}

	create() {
		this.roundOver = false;

		this.add.text(20, 20, "Mini Fighter", {
			fontSize: "24px",
			color: "#ffffff",
		});

		this.controlsText = this.add.text(
			20,
			50,
			"A/D = move | W eller Space = jump | S = fast fall | S + jump = drop through | Shift = guard | Shift + A/D = dash | J = attack | R = restart",
			{
				fontSize: "16px",
				color: "#ffffff",
				wordWrap: { width: 900 },
			},
		);

		this.resultText = this.add.text(20, 100, "", {
			fontSize: "20px",
			color: "#ffffff",
		});

		this.ground = this.add.rectangle(
			settings.gameWidth / 2,
			settings.gameHeight - 40,
			settings.gameWidth,
			80,
			0x3a3a3a,
		);
		this.physics.add.existing(this.ground, true);

		this.platform = this.add.rectangle(
			settings.gameWidth / 2,
			settings.gameHeight - 180,
			220,
			20,
			0x555555,
		);
		this.physics.add.existing(this.platform, true);

		this.leftWall = this.add.rectangle(
			10,
			settings.gameHeight / 2,
			20,
			settings.gameHeight,
			0x2a2a2a,
		);
		this.physics.add.existing(this.leftWall, true);

		this.rightWall = this.add.rectangle(
			settings.gameWidth - 10,
			settings.gameHeight / 2,
			20,
			settings.gameHeight,
			0x2a2a2a,
		);
		this.physics.add.existing(this.rightWall, true);

		this.player = new Player(this, 200, 300, fighters.player);
		this.bot = new Bot(this, 760, 300, fighters.botEasy, this.player);

		this.physics.add.collider(this.player, this.ground);
		this.physics.add.collider(this.bot, this.ground);

		this.physics.add.collider(
			this.player,
			this.platform,
			null,
			this.shouldCollideWithPlatform,
			this,
		);

		this.physics.add.collider(
			this.bot,
			this.platform,
			null,
			this.shouldCollideWithPlatform,
			this,
		);

		this.physics.add.collider(this.player, this.leftWall);
		this.physics.add.collider(this.player, this.rightWall);
		this.physics.add.collider(this.bot, this.leftWall);
		this.physics.add.collider(this.bot, this.rightWall);

		this.restartKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.R,
		);
	}

	shouldCollideWithPlatform(fighter, platform) {
		const now = this.time.now;

		if (fighter.isIgnoringPlatforms(now)) {
			return false;
		}

		const fighterBody = fighter.body;
		const platformBody = platform.body;

		const fighterBottom = fighterBody.y + fighterBody.height;
		const platformTop = platformBody.y;

		const isFallingOrStill = fighterBody.velocity.y >= 0;
		const isAbovePlatform = fighterBottom <= platformTop + 12;

		if (!isFallingOrStill) {
			return false;
		}

		if (!isAbovePlatform) {
			return false;
		}

		return true;
	}

	update(time) {
		if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
			this.scene.restart();
			return;
		}

		if (this.roundOver) return;

		this.player.update(time);
		this.bot.update(time);

		if (this.player.wantsToAttack()) {
			const hit = tryAttack(this.player, this.bot, settings.attackRange);
			if (hit) {
				this.endRound("Spelaren vann!");
				return;
			}
		}

		if (this.bot.wantsToAttack(time)) {
			const hit = tryAttack(this.bot, this.player, settings.attackRange);
			if (hit) {
				this.endRound("Botten vann!");
				return;
			}
		}

		if (this.player.y > settings.gameHeight + 100) {
			this.player.die();
			this.endRound("Botten vann!");
			return;
		}

		if (this.bot.y > settings.gameHeight + 100) {
			this.bot.die();
			this.endRound("Spelaren vann!");
		}
	}

	endRound(message) {
		this.roundOver = true;
		this.resultText.setText(`${message} Tryck R för restart`);
	}
}
