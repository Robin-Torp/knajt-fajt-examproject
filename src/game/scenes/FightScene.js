import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Bot } from "../entities/Bot";
import { fighters } from "../data/fighters";
import { settings } from "../data/settings";
import { resolveCombat } from "../systems/combat";
import { stageLayout, TILE_SIZE, GROUND_Y } from "../systems/StageLayouts";
import { saveMatch } from "../services/leaderboardService";

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

		this.currentStage = stageLayout;

		this.createStaticBackground();
		this.createAtmosphere();
		this.createHud();
		this.createStageContainers();
		this.buildStage(this.currentStage);

		this.pauseKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC,
		);

		this.player = new Player(
			this,
			this.currentStage.spawnPoints.player.x,
			this.currentStage.spawnPoints.player.y,
			fighters.player,
		);

		this.bot = new Bot(
			this,
			this.currentStage.spawnPoints.bot.x,
			this.currentStage.spawnPoints.bot.y,
			fighters.botEasy,
			null,
		);

		this.bot.target = this.player;

		this.applySpawnFacing(
			this.player,
			this.currentStage.spawnPoints.player.facing,
		);
		this.applySpawnFacing(this.bot, this.currentStage.spawnPoints.bot.facing);

		this.player.setBounce(0, 0);
		this.bot.setBounce(0, 0);

		this.setupStageColliders();
		this.updateStockText();
		this.startMatchSequence();
	}

	createHud() {
		this.playerHudName = this.add.text(20, 16, fighters.player.name || "P1", {
			fontSize: "24px",
			color: fighters.player.uiColor || "#ffffff",
		});

		this.playerHudStocks = this.add.text(20, 44, "● ● ●", {
			fontSize: "22px",
			color: "#ffffff",
			stroke: "#000000",
			strokeThickness: 4,
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
				stroke: "#000000",
				strokeThickness: 4,
			})
			.setOrigin(1, 0);

		this.resultText = this.add
			.text(settings.gameWidth / 2, 20, "", {
				fontSize: "24px",
				color: "#ffffff",
			})
			.setOrigin(0.5, 0);
	}

	createStaticBackground() {
		this.bgLayers = {};

		const layers = [
			"bg-layer5",
			"bg-layer4",
			"bg-layer3",
			"bg-layer2",
			"bg-layer1",
		];

		layers.forEach((key, index) => {
			const bg = this.add.image(0, 0, key).setOrigin(0);
			bg.setDisplaySize(settings.gameWidth, settings.gameHeight);
			bg.setDepth(-50 + index);
			this.bgLayers[key] = bg;
		});

		this.sun = this.add.image(1100, 100, "sun");
		this.sun.setDepth(-49.5);
		this.sun.setScale(1.5);

		this.tweens.add({
			targets: this.sun,
			scale: 1.55,
			duration: 4000,
			ease: "Sine.InOut",
			yoyo: true,
			repeat: -1,
		});
	}

	createAtmosphere() {
		this.clouds = [];
		this.birds = [];

		this.startTreeWind();
		this.spawnInitialClouds();
		this.startBirdSpawner();
	}

	startTreeWind() {
		const swayConfigs = [
			{ key: "bg-layer1", distance: 4, duration: 7200, direction: 1 },

			{ key: "bg-layer2", distance: 3, duration: 8600, direction: -1 },

			{ key: "bg-layer3", distance: 2, duration: 9800, direction: 1 },
		];

		swayConfigs.forEach(({ key, distance, duration, direction }) => {
			const layer = this.bgLayers?.[key];
			if (!layer) return;

			this.tweens.add({
				targets: layer,
				x: direction * distance,
				duration,
				ease: "Sine.InOut",
				yoyo: true,
				repeat: -1,
			});
		});
	}

	spawnInitialClouds() {
		const cloudKeys = ["cloud1", "cloud2", "cloud3", "cloud6"];

		for (let i = 0; i < 5; i += 1) {
			const key = Phaser.Utils.Array.GetRandom(cloudKeys);
			const x = Phaser.Math.Between(0, settings.gameWidth);
			const y = Phaser.Math.Between(35, 170);
			const speed = Phaser.Math.FloatBetween(3, 8);
			const scale = Phaser.Math.FloatBetween(0.9, 1.2);

			const cloud = this.add.image(x, y, key);
			cloud.setDepth(-48);
			cloud.setScale(scale);
			cloud.speed = speed;

			this.clouds.push(cloud);
		}
	}

	respawnCloud(cloud, fromRight = true) {
		const cloudKeys = ["cloud1", "cloud2", "cloud3", "cloud6"];

		cloud.setTexture(Phaser.Utils.Array.GetRandom(cloudKeys));
		cloud.x = fromRight
			? settings.gameWidth + Phaser.Math.Between(40, 220)
			: -Phaser.Math.Between(40, 220);
		cloud.y = Phaser.Math.Between(35, 170);
		cloud.speed = Phaser.Math.FloatBetween(3, 8);
		cloud.setScale(Phaser.Math.FloatBetween(0.9, 1.2));
		cloud.setDepth(-48);
	}

	startBirdSpawner() {
		this.time.addEvent({
			delay: 9000,
			loop: true,
			callback: () => {
				if (Math.random() > 0.6) return;
				this.spawnBird();
			},
		});
	}

	spawnBird() {
		const fromLeft = Math.random() > 0.5;
		const x = fromLeft ? -80 : settings.gameWidth + 80;
		const y = Phaser.Math.Between(50, 180);
		const speed = Phaser.Math.FloatBetween(50, 70);

		const bird = this.add.image(x, y, "birds1");
		bird.setDepth(-45);
		bird.speed = fromLeft ? speed : -speed;

		if (!fromLeft) {
			bird.setFlipX(true);
		}

		this.tweens.add({
			targets: bird,
			y: y + Phaser.Math.Between(-8, 8),
			duration: Phaser.Math.Between(900, 1600),
			ease: "Sine.InOut",
			yoyo: true,
			repeat: -1,
		});

		this.birds.push(bird);
	}

	updateAtmosphere(delta) {
		const dt = delta / 1000;

		this.clouds.forEach((cloud) => {
			cloud.x -= cloud.speed * dt;

			if (cloud.x < -250) {
				this.respawnCloud(cloud, true);
			}
		});

		for (let i = this.birds.length - 1; i >= 0; i -= 1) {
			const bird = this.birds[i];
			bird.x += bird.speed * dt;

			if (bird.x < -140 || bird.x > settings.gameWidth + 140) {
				bird.destroy();
				this.birds.splice(i, 1);
			}
		}
	}

	createStageContainers() {
		this.groundBodies = [];
		this.platformBodies = [];
		this.wallBodies = [];
		this.stageVisuals = [];
		this.decorSprites = [];
		this.stageColliders = [];
	}

	buildStage(stage) {
		stage.ground.forEach((segment) => {
			this.spawnGroundSegment(segment.xTiles, segment.widthTiles);
		});

		stage.platforms.forEach((platform) => {
			this.spawnPlatform(platform.xTiles, platform.y, platform.widthTiles);
		});

		this.spawnSideWallCollider(
			stage.sideWalls.leftX,
			stage.sideWalls.width,
			stage.sideWalls.height,
		);

		this.spawnSideWallCollider(
			stage.sideWalls.rightX,
			stage.sideWalls.width,
			stage.sideWalls.height,
		);

		stage.decorBack?.forEach((item) => this.spawnDecorItem(item));
		stage.decorMid?.forEach((item) => this.spawnDecorItem(item));
		stage.decorFront?.forEach((item) => this.spawnDecorItem(item));
	}

	spawnGroundSegment(startTile, widthTiles) {
		const startX = startTile * TILE_SIZE;
		const widthPx = widthTiles * TILE_SIZE;

		const body = this.add.rectangle(
			startX + widthPx / 2,
			GROUND_Y + 32,
			widthPx,
			64,
			0x000000,
			0,
		);

		this.physics.add.existing(body, true);
		body.setDepth(-2);
		this.groundBodies.push(body);

		const topLeft = 0;
		const topMid = 1;
		const topRight = 2;

		const fillLeft = 9;
		const fillMid = 10;
		const fillRight = 11;

		for (let i = 0; i < widthTiles; i += 1) {
			let topFrame = topMid;
			let fillFrame = fillMid;

			if (i === 0) {
				topFrame = topLeft;
				fillFrame = fillLeft;
			} else if (i === widthTiles - 1) {
				topFrame = topRight;
				fillFrame = fillRight;
			}

			const x = startX + i * TILE_SIZE + TILE_SIZE / 2;

			const topTile = this.add.image(
				x,
				GROUND_Y + TILE_SIZE / 2,
				"floor-tiles",
				topFrame,
			);
			topTile.setDisplaySize(TILE_SIZE, TILE_SIZE);
			topTile.setDepth(-3);
			this.stageVisuals.push(topTile);

			const fillTile = this.add.image(
				x,
				GROUND_Y + TILE_SIZE + TILE_SIZE / 2,
				"floor-tiles",
				fillFrame,
			);
			fillTile.setDisplaySize(TILE_SIZE, TILE_SIZE);
			fillTile.setDepth(-3);
			this.stageVisuals.push(fillTile);
		}
	}

	spawnPlatform(xTiles, y, widthTiles) {
		const startX = xTiles * TILE_SIZE;
		const widthPx = widthTiles * TILE_SIZE;

		const bodyHeight = 18;
		const bodyOffsetY = -7;

		const body = this.add.rectangle(
			startX + widthPx / 2,
			y + bodyOffsetY,
			widthPx,
			bodyHeight,
			0x000000,
			0,
		);

		this.physics.add.existing(body, true);
		body.setDepth(-2);
		this.platformBodies.push(body);

		const leftFrame = 0;
		const middleFrame = 1;
		const rightFrame = 2;

		for (let i = 0; i < widthTiles; i += 1) {
			let frame = middleFrame;

			if (i === 0) frame = leftFrame;
			else if (i === widthTiles - 1) frame = rightFrame;

			const tile = this.add.image(
				startX + i * TILE_SIZE + TILE_SIZE / 2,
				y,
				"floor-tiles",
				frame,
			);

			tile.setDisplaySize(TILE_SIZE, TILE_SIZE);
			tile.setDepth(-3);
			this.stageVisuals.push(tile);
		}
	}

	spawnSideWallCollider(x, width, height) {
		const wall = this.add.rectangle(
			x,
			settings.gameHeight / 2,
			width,
			height,
			0x000000,
			0,
		);

		this.physics.add.existing(wall, true);
		this.wallBodies.push(wall);
	}

	spawnDecorItem(item) {
		if (!this.textures.exists(item.key)) return;

		const x = item.x + (item.xOffset ?? 0);
		const y = item.y + (item.yOffset ?? 0);

		let obj;

		if (item.type === "image") {
			obj = this.add.image(x, y, item.key);
		} else {
			obj = this.add.sprite(x, y, item.key, item.frame ?? 0);
		}

		obj.setOrigin(item.originX ?? 0.5, item.originY ?? 1);
		obj.setDepth(item.depth ?? -4);

		if (item.scale) {
			obj.setScale(item.scale);
		}

		if (item.flipX) {
			obj.setFlipX(true);
		}

		if (item.animated) {
			const animKey = item.animKey || `${item.key}-loop`;

			if (this.anims.exists(animKey)) {
				obj.play(animKey);
			}
		}

		this.decorSprites.push(obj);
	}

	setupStageColliders() {
		this.groundBodies.forEach((body) => {
			this.stageColliders.push(this.physics.add.collider(this.player, body));
			this.stageColliders.push(this.physics.add.collider(this.bot, body));
		});

		this.platformBodies.forEach((body) => {
			this.stageColliders.push(
				this.physics.add.collider(
					this.player,
					body,
					null,
					this.shouldCollideWithPlatform,
					this,
				),
			);

			this.stageColliders.push(
				this.physics.add.collider(
					this.bot,
					body,
					null,
					this.shouldCollideWithPlatform,
					this,
				),
			);
		});

		this.wallBodies.forEach((body) => {
			this.stageColliders.push(this.physics.add.collider(this.player, body));
			this.stageColliders.push(this.physics.add.collider(this.bot, body));
		});
	}

	applySpawnFacing(fighter, facing) {
		fighter.facing = facing;

		if (facing === "right") {
			fighter.setFlipX(true);
		} else {
			fighter.setFlipX(false);
		}
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

		const centerX = settings.gameWidth / 2;
		const centerY = settings.gameHeight / 2;

		const text = this.add
			.text(centerX, centerY, "3", {
				fontFamily: "Canterbury",
				fontSize: "64px",
				color: "#ffffff",
			})
			.setOrigin(0.5);

		const spawnPlayer = this.currentStage.spawnPoints.player;
		const spawnBot = this.currentStage.spawnPoints.bot;

		this.player.resetState();
		this.bot.resetState();

		this.player.setPosition(spawnPlayer.x, spawnPlayer.y);
		this.bot.setPosition(spawnBot.x, spawnBot.y);

		this.player.setVelocity(0, 0);
		this.bot.setVelocity(0, 0);

		this.applySpawnFacing(this.player, spawnPlayer.facing);
		this.applySpawnFacing(this.bot, spawnBot.facing);

		let count = 3;

		const tick = () => {
			if (count > 1) {
				count -= 1;
				text.setText(String(count));
				this.pulseText(text);

				this.time.delayedCall(500, tick);
				return;
			}

			text.setText("FAJT!");
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

	update(time, delta) {
		if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
			this.scene.launch("PauseScene");
			this.scene.pause();
			return;
		}
		this.updateAtmosphere(delta);

		if (this.roundOver) return;

		this.player.update(time);
		this.bot.update(time);

		if (!this.matchDecided && !this.isRespawning && !this.isMatchStarting) {
			if (this.player.wantsToAttack()) {
				this.player.startAttack();
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

			if (this.player.y > settings.gameHeight + 120) {
				this.player.die();
				this.handleKO("player");
				return;
			}

			if (this.bot.y > settings.gameHeight + 120) {
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
		const spawn =
			loser === "player"
				? this.currentStage.spawnPoints.player
				: this.currentStage.spawnPoints.bot;

		fighter.resetState();
		fighter.setPosition(spawn.x, spawn.y);
		fighter.setVelocity(0, 0);
		fighter.setBounce(0, 0);

		this.applySpawnFacing(fighter, spawn.facing);
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

		const playerName = this.registry.get("playerName") || "P1 (Guest)";
		const userId = this.registry.get("userId");

		const didPlayerWin = message === "Player won!";

		const winnerText = didPlayerWin ? `${playerName} Wins!` : "Bot Wins!";

		this.resultText.setText(winnerText);

		saveMatch({
			userId,
			username: playerName,
			win: didPlayerWin,
		});

		this.tweens.add({
			targets: this.resultText,
			alpha: 0,
			duration: 1500,
			delay: 1500,
			onComplete: () => {
				this.scene.start("MenuScene");
			},
		});
	}
}
