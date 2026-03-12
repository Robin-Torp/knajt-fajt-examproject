import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Bot } from "../entities/Bot";
import { fighters } from "../data/fighters";
import { settings } from "../data/settings";
import { tryAttack } from "../systems/combat";
import { restartRound } from "../systems/roundManager";

export class FightScene extends Phaser.Scene {
	constructor() {
		super("FightScene");
	}

	create() {
		this.add.text(20, 20, "Knajt Fajt", {
			fontSize: "24px",
			color: "#ffffff",
		});

		this.resultText = this.add.text(20, 55, "", {
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

		this.player = new Player(this, 200, 300, fighters.player);
		this.bot = new Bot(this, 760, 300, fighters.botEasy, this.player);

		this.physics.add.collider(this.player, this.ground);
		this.physics.add.collider(this.bot, this.ground);
		this.physics.add.collider(this.player, this.platform);
		this.physics.add.collider(this.bot, this.platform);

		this.restartKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.R,
		);

		this.roundOver = false;
	}

	update(time) {
		if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
			restartRound(this);
			return;
		}

		if (this.roundOver) return;

		this.player.update();
		this.bot.update(time);

		if (this.player.wantsToAttack()) {
			const hit = tryAttack(this.player, this.bot, settings.attackRange);
			if (hit) {
				this.endRound("Player won!");
			}
		}

		if (this.bot.wantsToAttack(time)) {
			const hit = tryAttack(this.bot, this.player, settings.attackRange);
			if (hit) {
				this.endRound("Bot won!");
			}
		}

		if (this.player.y > settings.gameHeight + 100) {
			this.player.die();
			this.endRound("Bot won!");
		}

		if (this.bot.y > settings.gameHeight + 100) {
			this.bot.die();
			this.endRound("Player won!");
		}
	}

	endRound(message) {
		this.roundOver = true;
		this.resultText.setText(`${message}  Press R to restart`);

		this.time.delayedCall(settings.roundRestartDelay, () => {
			// Fixa auto restart senare
		});
	}
}
