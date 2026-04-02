import Phaser from "phaser";
import { settings } from "../data/settings";

// PauseScene läggs ovanpå FightScene när matchen pausas.
// Den visar en overlay med knappar för att fortsätta, starta om,
// gå till menyn och justera ljudnivåer.

export class PauseScene extends Phaser.Scene {
	constructor() {
		super("PauseScene");
	}

	// Skapar pausmenyn ovanpå den pågående matchen.
	create() {
		this.music = this.registry.get("musicVolume") ?? 0.6;
		this.sfx = this.registry.get("sfxVolume") ?? 0.8;
		this.activeOverlay = null;

		this.add
			.rectangle(
				settings.gameWidth / 2,
				settings.gameHeight / 2,
				settings.gameWidth,
				settings.gameHeight,
				0x000000,
				0.5,
			)
			.setDepth(200);

		this.panel = this.add.container(0, 0).setDepth(201);

		const cx = settings.gameWidth / 2;
		const cy = settings.gameHeight / 2;

		const panelShadow = this.add.rectangle(
			cx + 8,
			cy + 10,
			500,
			390,
			0x000000,
			0.35,
		);
		const panelBg = this.add
			.rectangle(cx, cy, 500, 390, 0x19120c, 0.97)
			.setStrokeStyle(3, 0xd8c38c);

		const title = this.add
			.text(cx, cy - 145, "Paused", {
				fontFamily: "Canterbury, Georgia, serif",
				fontSize: "50px",
				color: "#f8f1dc",
				stroke: "#000000",
				strokeThickness: 4,
			})
			.setOrigin(0.5);

		this.panel.add([panelShadow, panelBg, title]);

		this.makeButton(cx, cy - 65, "Resume", () => {
			this.resumeGame();
		});

		this.makeButton(cx, cy + 5, "Restart Match", () => {
			this.scene.stop();
			this.scene.stop("FightScene");
			this.scene.start("FightScene");
		});

		this.makeButton(cx, cy + 75, "Main Menu", () => {
			this.scene.stop();
			this.scene.stop("FightScene");
			this.scene.start("MenuScene");
		});

		this.makeButton(cx, cy + 145, "Settings", () => {
			if (this.activeOverlay === "settings") {
				this.closeSettings();
				return;
			}
			this.openSettings();
		});

		this.input.keyboard.on("keydown-ESC", () => {
			if (this.activeOverlay === "settings") {
				this.closeSettings();
				return;
			}
			this.resumeGame();
		});
	}

	// Samma typ av knappidé som i menyn men anpassad för pauspanelen.
	makeButton(x, y, label, onClick) {
		const outer = this.add
			.rectangle(x, y, 300, 54, 0x2d2115, 0.98)
			.setStrokeStyle(3, 0xd8c38c)
			.setDepth(202)
			.setInteractive({ useHandCursor: true });

		const inner = this.add
			.rectangle(x, y, 286, 40, 0x000000, 0.45)
			.setDepth(203);

		const text = this.add
			.text(x, y, label, {
				fontFamily: "Canterbury, Georgia, serif",
				fontSize: "28px",
				color: "#f8f1dc",
				stroke: "#000000",
				strokeThickness: 3,
			})
			.setOrigin(0.5)
			.setDepth(204);

		outer.on("pointerover", () => {
			if (this.activeOverlay === "settings") return;
			outer.setFillStyle(0x46311e, 1);
			inner.setFillStyle(0xffffff, 0.08);
			text.y = y - 1;
		});

		outer.on("pointerout", () => {
			outer.setFillStyle(0x2d2115, 0.98);
			inner.setFillStyle(0x000000, 0.45);
			text.y = y;
		});

		outer.on("pointerdown", onClick);
	}

	// Öppnar en mindre ljudpanel inne i pausmenyn.
	openSettings() {
		this.activeOverlay = "settings";

		const cx = settings.gameWidth / 2;
		const cy = settings.gameHeight / 2;

		this.settingsBlocker = this.add
			.rectangle(0, 0, settings.gameWidth, settings.gameHeight, 0x000000, 0.25)
			.setOrigin(0, 0)
			.setDepth(210)
			.setInteractive();

		this.settingsBlocker.on("pointerdown", () => {});

		this.settingsContainer = this.add.container(0, 0).setDepth(211);

		const shadow = this.add.rectangle(
			cx + 8,
			cy + 10,
			440,
			250,
			0x000000,
			0.35,
		);

		const bg = this.add
			.rectangle(cx, cy, 440, 250, 0x1e1610, 0.98)
			.setStrokeStyle(3, 0xd8c38c);

		const title = this.add
			.text(cx, cy - 88, "Audio Settings", {
				fontFamily: "Canterbury, Georgia, serif",
				fontSize: "34px",
				color: "#f8f1dc",
				stroke: "#000000",
				strokeThickness: 4,
			})
			.setOrigin(0.5);

		const closeBg = this.add
			.rectangle(cx + 185, cy - 92, 34, 34, 0x6d1919, 1)
			.setStrokeStyle(2, 0xf5e6c8)
			.setInteractive({ useHandCursor: true });

		const closeText = this.add
			.text(cx + 185, cy - 92, "X", {
				fontSize: "18px",
				color: "#ffffff",
			})
			.setOrigin(0.5);

		closeBg.on("pointerdown", () => this.closeSettings());

		const musicLabel = this.add
			.text(cx - 140, cy - 25, "Music", {
				fontFamily: "Canterbury, Georgia, serif",
				fontSize: "28px",
				color: "#f3ead1",
			})
			.setOrigin(0, 0.5);

		const sfxLabel = this.add
			.text(cx - 140, cy + 40, "SFX", {
				fontFamily: "Canterbury, Georgia, serif",
				fontSize: "28px",
				color: "#f3ead1",
			})
			.setOrigin(0, 0.5);

		this.musicValueText = this.add
			.text(cx + 10, cy - 25, `${Math.round(this.music * 100)}%`, {
				fontFamily: "Georgia, serif",
				fontSize: "24px",
				color: "#ffffff",
			})
			.setOrigin(0.5);

		this.sfxValueText = this.add
			.text(cx + 10, cy + 40, `${Math.round(this.sfx * 100)}%`, {
				fontFamily: "Georgia, serif",
				fontSize: "24px",
				color: "#ffffff",
			})
			.setOrigin(0.5);

		const musicMinus = this.makeMiniButton(cx + 105, cy - 25, "-", () => {
			this.music = Math.max(0, this.roundVolume(this.music - 0.1));
			this.registry.set("musicVolume", this.music);
			this.musicValueText.setText(`${Math.round(this.music * 100)}%`);
			updateMusicVolume(this);
			saveAudioSettings({
				musicVolume: this.music,
				sfxVolume: this.sfx,
			});
		});

		const musicPlus = this.makeMiniButton(cx + 160, cy - 25, "+", () => {
			this.music = Math.min(1, this.roundVolume(this.music + 0.1));
			this.registry.set("musicVolume", this.music);
			this.musicValueText.setText(`${Math.round(this.music * 100)}%`);
			updateMusicVolume(this);
			saveAudioSettings({
				musicVolume: this.music,
				sfxVolume: this.sfx,
			});
		});

		const sfxMinus = this.makeMiniButton(cx + 105, cy + 40, "-", () => {
			this.sfx = Math.max(0, this.roundVolume(this.sfx - 0.1));
			this.registry.set("sfxVolume", this.sfx);
			this.sfxValueText.setText(`${Math.round(this.sfx * 100)}%`);
			saveAudioSettings({
				musicVolume: this.music,
				sfxVolume: this.sfx,
			});
		});

		const sfxPlus = this.makeMiniButton(cx + 160, cy + 40, "+", () => {
			this.sfx = Math.min(1, this.roundVolume(this.sfx + 0.1));
			this.registry.set("sfxVolume", this.sfx);
			this.sfxValueText.setText(`${Math.round(this.sfx * 100)}%`);
			saveAudioSettings({
				musicVolume: this.music,
				sfxVolume: this.sfx,
			});
		});

		this.settingsContainer.add([
			shadow,
			bg,
			title,
			closeBg,
			closeText,
			musicLabel,
			sfxLabel,
			this.musicValueText,
			this.sfxValueText,
			...musicMinus,
			...musicPlus,
			...sfxMinus,
			...sfxPlus,
		]);
	}

	// Tar bort inställningspanelen utan att stänga hela pause-scenen.
	closeSettings() {
		this.activeOverlay = null;

		if (this.settingsBlocker) {
			this.settingsBlocker.destroy();
			this.settingsBlocker = null;
		}

		if (this.settingsContainer) {
			this.settingsContainer.destroy(true);
			this.settingsContainer = null;
		}
	}

	// Små plus- och minusknappar för att ändra volym.
	makeMiniButton(x, y, label, onClick) {
		const bg = this.add
			.rectangle(x, y, 42, 42, 0x2e2217, 1)
			.setStrokeStyle(2, 0xf0dfb0)
			.setDepth(212)
			.setInteractive({ useHandCursor: true });

		const text = this.add
			.text(x, y, label, {
				fontFamily: "Georgia, serif",
				fontSize: "28px",
				color: "#ffffff",
			})
			.setOrigin(0.5)
			.setDepth(213);

		bg.on("pointerover", () => bg.setFillStyle(0x4a3623, 1));
		bg.on("pointerout", () => bg.setFillStyle(0x2e2217, 1));
		bg.on("pointerdown", onClick);

		return [bg, text];
	}

	// Hjälper till att hålla volymen inom tydliga steg.
	roundVolume(value) {
		return Math.round(value * 10) / 10;
	}

	// Återupptar matchen och stänger pause-scenen.
	resumeGame() {
		this.closeSettings();
		this.scene.stop();
		this.scene.resume("FightScene");
	}
}
