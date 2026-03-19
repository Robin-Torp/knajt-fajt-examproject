import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Bot } from "../entities/Bot";
import { fighters } from "../data/fighters";
import { settings } from "../data/settings";
import { resolveCombat } from "../systems/combat";

export class FightScene extends Phaser.Scene {
	constructor() {
		super("FightScene");
	}

	create() {
		this.roundOver = false;
		this.matchDecided = false;
		this.isRespawning = false;
		this.isMatchStarting = false;

		this.playerStocks = 3;
		this.botStocks = 3;

		this.playerHudName = this.add.text(20, 16, fighters.player.name || "P1", {
			fontSize: "24px",
			color: fighters.player.uiColor || "#ffffff",
		});

		this.playerHudStocks = this.add.text(20, 44, "● ● ●", {
			fontSize: "22px",
			color: "#ffffff",
		});

		this.botHudName = this.add
			.text(settings.gameWidth - 20, 16, fighters.botEasy.name || "BOT", {
				fontSize: "24px",
				color: fighters.botEasy.uiColor || "#ffffff",
			})
			.setOrigin(1, 0);

		this.botHudStocks = this.add
			.text(settings.gameWidth - 20, 44, "● ● ●", {
				fontSize: "22px",
				color: "#ffffff",
			})
			.setOrigin(1, 0);

		this.resultText = this.add
			.text(settings.gameWidth / 2, 20, "", {
				fontSize: "24px",
				color: "#ffffff",
			})
			.setOrigin(0.5, 0);

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

		this.player.faceTarget(this.bot);
		this.bot.faceTarget(this.player);

		this.player.setBounce(0, 0);
		this.bot.setBounce(0, 0);

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

		this.updateStockText();
		this.startMatchSequence();
	}

	updateStockText() {
		this.playerHudStocks.setText("● ".repeat(this.playerStocks).trim() || "—");
		this.botHudStocks.setText("● ".repeat(this.botStocks).trim() || "—");
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

		if (!isFallingOrStill) return false;
		if (!isAbovePlatform) return false;

		return true;
	}

	startMatchSequence() {
		this.isMatchStarting = true;

		this.player.setVelocity(0, 0);
		this.bot.setVelocity(0, 0);

		const centerX = settings.gameWidth / 2;
		const centerY = settings.gameHeight / 2;

		const text = this.add
			.text(centerX, centerY, "3", {
				fontSize: "64px",
				color: "#ffffff",
			})
			.setOrigin(0.5);

		let count = 3;

		const tick = () => {
			if (count > 1) {
				count -= 1;
				text.setText(String(count));
				this.pulseText(text);

				this.time.delayedCall(500, tick);
				return;
			}

			text.setText("FIGHT!");
			this.pulseText(text);

			this.cameras.main.shake(120, 0.006);

			this.tweens.add({
				targets: this.cameras.main,
				zoom: 1.06,
				duration: 120,
				yoyo: true,
				ease: "Quad.Out",
			});

			this.time.delayedCall(500, () => {
				text.destroy();
				this.isMatchStarting = false;
			});
		};

		this.pulseText(text);
		this.time.delayedCall(500, tick);
	}

	pulseText(text) {
		text.setScale(0.5);
		text.setAlpha(0);

		this.tweens.add({
			targets: text,
			scale: 1.15,
			alpha: 1,
			duration: 160,
			ease: "Back.Out",
			yoyo: true,
			hold: 60,
		});
	}

	update(time) {
		if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
			this.scene.restart();
			return;
		}

		if (this.roundOver) return;

		this.player.update(time);
		this.bot.update(time);

		if (!this.matchDecided && !this.isRespawning && !this.isMatchStarting) {
			if (this.player.wantsToAttack()) {
				this.player.startAttack();
			}

			if (this.bot.wantsToAttack(time)) {
				this.bot.startAttack();
			}

			const combatResult = resolveCombat(this, this.player, this.bot);

			if (combatResult.clash) {
				return;
			}

			if (combatResult.winner === "A") {
				this.handleKO("bot");
				return;
			}

			if (combatResult.winner === "B") {
				this.handleKO("player");
				return;
			}

			if (this.player.y > settings.gameHeight + 100) {
				this.player.die();
				this.handleKO("player");
				return;
			}

			if (this.bot.y > settings.gameHeight + 100) {
				this.bot.die();
				this.handleKO("bot");
				return;
			}
		}
	}

	handleKO(loser) {
		if (this.isRespawning || this.matchDecided) return;

		this.isRespawning = true;

		if (loser === "player") {
			this.playerStocks -= 1;
		} else {
			this.botStocks -= 1;
		}

		this.updateStockText();

		this.time.delayedCall(1600, () => {
			if (this.playerStocks <= 0) {
				this.matchDecided = true;
				this.endRound("Bot won!");
				return;
			}

			if (this.botStocks <= 0) {
				this.matchDecided = true;
				this.endRound("Player won!");
				return;
			}

			this.respawnFighter(loser);
			this.isRespawning = false;
		});
	}

	respawnFighter(loser) {
		const fighter = loser === "player" ? this.player : this.bot;
		const opponent = loser === "player" ? this.bot : this.player;

		fighter.resetState();

		if (loser === "player") {
			fighter.setPosition(220, 120);
		} else {
			fighter.setPosition(740, 120);
		}

		fighter.setVelocity(0, 0);
		fighter.setBounce(0, 0);

		this.applyRespawnInvulnerability(fighter);
	}

	applyRespawnInvulnerability(fighter) {
		fighter.hasIFrames = true;

		let flashes = 0;

		const flash = () => {
			if (!fighter || fighter.isDead) return;

			fighter.setTintFill(0xffffff);
			if (fighter.sword) {
				fighter.sword.setTintFill(0xffffff);
			}

			this.time.delayedCall(70, () => {
				fighter.clearTint();
				if (fighter.sword) {
					fighter.sword.clearTint();
				}

				flashes += 1;

				if (flashes < 8) {
					this.time.delayedCall(70, flash);
				} else {
					fighter.hasIFrames = false;
				}
			});
		};

		flash();
	}

	endRound(message) {
		this.roundOver = true;
		this.resultText.setText(`${message} Press R to restart`);
	}
}
