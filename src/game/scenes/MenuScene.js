import Phaser from "phaser";
import { settings } from "../data/settings";
import {
	login,
	register,
	getCurrentUser,
	logout,
	getProfile,
} from "../services/authService";
import { getLeaderboard } from "../services/leaderboardService";

export class MenuScene extends Phaser.Scene {
	constructor() {
		super("MenuScene");
	}

	async create() {
		this.activeOverlay = null;
		this.overlayBlocker = null;
		this.settingsContainer = null;
		this.leaderboardContainer = null;
		this.authContainer = null;
		this.authDom = null;
		this.statusText = null;
		this.applyAuthDomStyles();

		if (this.registry.get("musicVolume") === undefined) {
			this.registry.set("musicVolume", 0.6);
		}

		if (this.registry.get("sfxVolume") === undefined) {
			this.registry.set("sfxVolume", 0.8);
		}

		this.createBackground();
		this.createVignette();
		this.createTitle();
		this.createButtons();
		this.createAccountBar();

		await this.syncUserFromSession();
	}

	async syncUserFromSession() {
		const { user } = await getCurrentUser();

		if (user) {
			const { data: profile } = await getProfile(user.id);

			const username =
				profile?.username ||
				user.user_metadata?.username ||
				user.email?.split("@")[0] ||
				"Player";

			this.registry.set("userId", user.id);
			this.registry.set("playerName", username);
		} else {
			this.registry.set("userId", null);

			if (!this.registry.get("playerName")) {
				this.registry.set("playerName", "Guest");
			}
		}

		this.refreshAccountBar();
	}

	createBackground() {
		this.layers = [
			{ key: "bg-layer5", speed: 0.08, depth: -10 },
			{ key: "bg-layer4", speed: 0.16, depth: -9 },
			{ key: "bg-layer3", speed: 0.28, depth: -8 },
			{ key: "bg-layer2", speed: 0.45, depth: -7 },
			{ key: "bg-layer1", speed: 0.7, depth: -6 },
		];

		this.bg = [];

		this.layers.forEach((layer) => {
			const a = this.add.image(0, 0, layer.key).setOrigin(0, 0);
			const b = this.add
				.image(settings.gameWidth, 0, layer.key)
				.setOrigin(0, 0);

			a.setDisplaySize(settings.gameWidth, settings.gameHeight);
			b.setDisplaySize(settings.gameWidth, settings.gameHeight);

			a.setDepth(layer.depth);
			b.setDepth(layer.depth);

			this.bg.push({ ...layer, images: [a, b] });
		});
	}

	createVignette() {
		this.add
			.rectangle(
				settings.gameWidth / 2,
				settings.gameHeight / 2,
				settings.gameWidth,
				settings.gameHeight,
				0x000000,
				0.12,
			)
			.setDepth(1);
	}

	createTitle() {
		const centerX = settings.gameWidth / 2;
		const y = 120;

		const redStyle = {
			fontFamily: "Canterbury, Georgia, serif",
			fontSize: "94px",
			color: "#a51616",
			stroke: "#120000",
			strokeThickness: 6,
		};

		const blackStyle = {
			fontFamily: "Canterbury, Georgia, serif",
			fontSize: "76px",
			color: "#111111",
			stroke: "#d4c5a1",
			strokeThickness: 1,
		};

		const parts = [
			this.add.text(0, y, "K", redStyle).setOrigin(0, 0.5).setDepth(20),
			this.add.text(0, y, "najt", blackStyle).setOrigin(0, 0.5).setDepth(20),
			this.add.text(0, y, " ", blackStyle).setOrigin(0, 0.5).setDepth(20),
			this.add.text(0, y, "F", redStyle).setOrigin(0, 0.5).setDepth(20),
			this.add.text(0, y, "ajt", blackStyle).setOrigin(0, 0.5).setDepth(20),
		];

		const totalWidth = parts.reduce((sum, part) => sum + part.width, 0);
		let currentX = centerX - totalWidth / 2;

		parts.forEach((part) => {
			part.x = currentX;
			currentX += part.width;
		});
	}

	createAccountBar() {
		const currentName = this.registry.get("playerName") || "Guest";

		this.statusText = this.add
			.text(20, 18, `Signed in as: ${currentName}`, {
				fontFamily: "Georgia, serif",
				fontSize: "20px",
				color: "#f6edd2",
				stroke: "#000000",
				strokeThickness: 3,
			})
			.setDepth(30);

		this.loginButtonTop = this.makeSmallTopButton(
			settings.gameWidth - 110,
			32,
			"Login",
			() => {
				if (this.activeOverlay) return;
				this.openAuthModal("login");
			},
		);

		this.logoutButtonTop = this.makeSmallTopButton(
			settings.gameWidth - 110,
			32,
			"Logout",
			async () => {
				if (this.activeOverlay) return;

				await logout();
				this.registry.set("userId", null);
				this.registry.set("playerName", "Guest");
				this.refreshAccountBar();
			},
		);
	}

	refreshAccountBar() {
		const userId = this.registry.get("userId");
		const playerName = this.registry.get("playerName") || "Guest";

		if (this.statusText) {
			this.statusText.setText(`Signed in as: ${playerName}`);
		}

		if (this.loginButtonTop) {
			this.loginButtonTop.outer.setVisible(!userId);
			this.loginButtonTop.inner.setVisible(!userId);
			this.loginButtonTop.text.setVisible(!userId);
		}

		if (this.logoutButtonTop) {
			this.logoutButtonTop.outer.setVisible(!!userId);
			this.logoutButtonTop.inner.setVisible(!!userId);
			this.logoutButtonTop.text.setVisible(!!userId);
		}
	}

	createButtons() {
		const cx = settings.gameWidth / 2;
		const startY = 285;
		const gap = 68;

		this.makeButton(cx, startY, "Play", () => {
			if (this.activeOverlay) return;

			const playerName = this.registry.get("playerName");
			const userId = this.registry.get("userId");

			if (!userId) {
				this.openAuthModal("login");
				return;
			}

			this.registry.set("playerName", playerName || "Player");
			this.scene.start("FightScene");
		});

		this.makeButton(cx, startY + gap, "Play as Guest", () => {
			if (this.activeOverlay) return;
			this.registry.set("userId", null);
			this.registry.set("playerName", "Guest");
			this.scene.start("FightScene");
		});

		this.makeButton(cx, startY + gap * 2, "Leaderboard", async () => {
			if (this.activeOverlay === "leaderboard") {
				this.closeOverlay();
				return;
			}
			if (this.activeOverlay) return;
			await this.openLeaderboard();
		});

		this.makeButton(cx, startY + gap * 3, "Settings", () => {
			if (this.activeOverlay === "settings") {
				this.closeOverlay();
				return;
			}
			if (this.activeOverlay) return;
			this.openSettings();
		});
	}

	makeButton(x, y, label, onClick) {
		const outer = this.add
			.rectangle(x, y, 320, 56, 0x2d2115, 0.95)
			.setStrokeStyle(3, 0xd8c38c)
			.setDepth(20)
			.setInteractive({ useHandCursor: true });

		const inner = this.add
			.rectangle(x, y, 306, 42, 0x000000, 0.45)
			.setDepth(21);

		const text = this.add
			.text(x, y, label, {
				fontFamily: "Canterbury, Georgia, serif",
				fontSize: "30px",
				color: "#f8f1dc",
				stroke: "#000000",
				strokeThickness: 3,
			})
			.setOrigin(0.5)
			.setDepth(22);

		outer.on("pointerover", () => {
			if (this.activeOverlay) return;
			outer.setFillStyle(0x46311e, 1);
			inner.setFillStyle(0xffffff, 0.08);
			text.y = y - 1;
		});

		outer.on("pointerout", () => {
			outer.setFillStyle(0x2d2115, 0.95);
			inner.setFillStyle(0x000000, 0.45);
			text.y = y;
		});

		outer.on("pointerdown", onClick);

		return { outer, inner, text };
	}

	makeSmallTopButton(x, y, label, onClick) {
		const outer = this.add
			.rectangle(x, y, 100, 34, 0x2d2115, 0.95)
			.setStrokeStyle(2, 0xd8c38c)
			.setDepth(30)
			.setInteractive({ useHandCursor: true });

		const inner = this.add.rectangle(x, y, 90, 24, 0x000000, 0.4).setDepth(31);

		const text = this.add
			.text(x, y, label, {
				fontFamily: "Georgia, serif",
				fontSize: "18px",
				color: "#f8f1dc",
			})
			.setOrigin(0.5)
			.setDepth(32);

		outer.on("pointerdown", onClick);

		return { outer, inner, text };
	}

	createOverlayBlocker() {
		this.overlayBlocker = this.add
			.rectangle(0, 0, settings.gameWidth, settings.gameHeight, 0x000000, 0.42)
			.setOrigin(0, 0)
			.setDepth(100)
			.setInteractive();

		this.overlayBlocker.on("pointerdown", () => {});
	}

	openSettings() {
		this.activeOverlay = "settings";

		const cx = settings.gameWidth / 2;
		const cy = settings.gameHeight / 2;

		this.music = this.registry.get("musicVolume") ?? 0.6;
		this.sfx = this.registry.get("sfxVolume") ?? 0.8;

		this.createOverlayBlocker();

		this.settingsContainer = this.add.container(0, 0).setDepth(101);

		const panel = this.add
			.rectangle(cx, cy, 470, 325, 0x19120c, 0.97)
			.setStrokeStyle(3, 0xd8c38c);

		const title = this.add
			.text(cx, cy - 118, "Audio Settings", {
				fontFamily: "Canterbury, Georgia, serif",
				fontSize: "38px",
				color: "#f8f1dc",
				stroke: "#000000",
				strokeThickness: 4,
			})
			.setOrigin(0.5);

		const closeBg = this.add
			.rectangle(cx + 200, cy - 123, 36, 36, 0x6d1919, 1)
			.setStrokeStyle(2, 0xf5e6c8)
			.setInteractive({ useHandCursor: true });

		const closeText = this.add
			.text(cx + 200, cy - 123, "X", {
				fontSize: "18px",
				color: "#ffffff",
			})
			.setOrigin(0.5);

		closeBg.on("pointerdown", () => this.closeOverlay());

		const musicLabel = this.add
			.text(cx - 130, cy - 35, "Music", {
				fontFamily: "Canterbury, Georgia, serif",
				fontSize: "30px",
				color: "#f3ead1",
			})
			.setOrigin(0, 0.5);

		const sfxLabel = this.add
			.text(cx - 130, cy + 35, "SFX", {
				fontFamily: "Canterbury, Georgia, serif",
				fontSize: "30px",
				color: "#f3ead1",
			})
			.setOrigin(0, 0.5);

		this.musicValueText = this.add
			.text(cx + 10, cy - 35, `${Math.round(this.music * 100)}%`, {
				fontFamily: "Georgia, serif",
				fontSize: "24px",
				color: "#ffffff",
			})
			.setOrigin(0.5);

		this.sfxValueText = this.add
			.text(cx + 10, cy + 35, `${Math.round(this.sfx * 100)}%`, {
				fontFamily: "Georgia, serif",
				fontSize: "24px",
				color: "#ffffff",
			})
			.setOrigin(0.5);

		const musicMinus = this.makeMiniButton(cx + 105, cy - 35, "-", () => {
			this.music = Math.max(0, this.roundVolume(this.music - 0.1));
			this.registry.set("musicVolume", this.music);
			this.musicValueText.setText(`${Math.round(this.music * 100)}%`);
		});

		const musicPlus = this.makeMiniButton(cx + 160, cy - 35, "+", () => {
			this.music = Math.min(1, this.roundVolume(this.music + 0.1));
			this.registry.set("musicVolume", this.music);
			this.musicValueText.setText(`${Math.round(this.music * 100)}%`);
		});

		const sfxMinus = this.makeMiniButton(cx + 105, cy + 35, "-", () => {
			this.sfx = Math.max(0, this.roundVolume(this.sfx - 0.1));
			this.registry.set("sfxVolume", this.sfx);
			this.sfxValueText.setText(`${Math.round(this.sfx * 100)}%`);
		});

		const sfxPlus = this.makeMiniButton(cx + 160, cy + 35, "+", () => {
			this.sfx = Math.min(1, this.roundVolume(this.sfx + 0.1));
			this.registry.set("sfxVolume", this.sfx);
			this.sfxValueText.setText(`${Math.round(this.sfx * 100)}%`);
		});

		this.settingsContainer.add([
			panel,
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

	async openLeaderboard() {
		this.activeOverlay = "leaderboard";
		this.createOverlayBlocker();

		const cx = settings.gameWidth / 2;
		const cy = settings.gameHeight / 2;

		const rows = await getLeaderboard();

		const boardLines = rows.length
			? rows
					.map(
						(row, i) =>
							`${i + 1}. ${row.username} - ${row.wins}W / ${row.losses}L`,
					)
					.join("\n")
			: "No leaderboard data yet";

		this.leaderboardContainer = this.add.container(0, 0).setDepth(101);

		const panel = this.add
			.rectangle(cx, cy, 520, 380, 0x19120c, 0.97)
			.setStrokeStyle(3, 0xd8c38c);

		const title = this.add
			.text(cx, cy - 135, "Leaderboard", {
				fontFamily: "Canterbury, Georgia, serif",
				fontSize: "40px",
				color: "#f8f1dc",
				stroke: "#000000",
				strokeThickness: 4,
			})
			.setOrigin(0.5);

		const closeBg = this.add
			.rectangle(cx + 225, cy - 140, 36, 36, 0x6d1919, 1)
			.setStrokeStyle(2, 0xf5e6c8)
			.setInteractive({ useHandCursor: true });

		const closeText = this.add
			.text(cx + 225, cy - 140, "X", {
				fontSize: "18px",
				color: "#ffffff",
			})
			.setOrigin(0.5);

		closeBg.on("pointerdown", () => this.closeOverlay());

		const content = this.add
			.text(cx, cy + 8, boardLines, {
				fontFamily: "Georgia, serif",
				fontSize: "26px",
				color: "#f3ead1",
				align: "center",
				lineSpacing: 12,
			})
			.setOrigin(0.5);

		this.leaderboardContainer.add([panel, title, closeBg, closeText, content]);
	}

	openAuthModal(defaultMode = "login") {
		this.activeOverlay = "auth";
		this.createOverlayBlocker();

		const cx = settings.gameWidth / 2;
		const cy = settings.gameHeight / 2;

		this.authContainer = this.add.container(0, 0).setDepth(101);

		const panelShadow = this.add.rectangle(
			cx + 8,
			cy + 10,
			620,
			560,
			0x000000,
			0.35,
		);
		const panel = this.add
			.rectangle(cx, cy, 620, 560, 0x19120c, 0.98)
			.setStrokeStyle(3, 0xd8c38c);

		const title = this.add
			.text(cx, cy - 215, "Account", {
				fontFamily: "Canterbury, Georgia, serif",
				fontSize: "44px",
				color: "#f8f1dc",
				stroke: "#000000",
				strokeThickness: 4,
			})
			.setOrigin(0.5);

		const closeBg = this.add
			.rectangle(cx + 265, cy - 220, 38, 38, 0x7d2626, 1)
			.setStrokeStyle(2, 0xf5e6c8)
			.setInteractive({ useHandCursor: true });

		const closeText = this.add
			.text(cx + 265, cy - 220, "X", {
				fontSize: "18px",
				color: "#ffffff",
			})
			.setOrigin(0.5);

		closeBg.on("pointerdown", () => this.closeOverlay());

		const hint = this.add
			.text(
				cx,
				cy - 165,
				"Sign in to save your wins and losses to the leaderboard",
				{
					fontFamily: "Georgia, serif",
					fontSize: "18px",
					color: "#e8dcc0",
					align: "center",
				},
			)
			.setOrigin(0.5);

		this.authContainer.add([
			panelShadow,
			panel,
			title,
			closeBg,
			closeText,
			hint,
		]);

		this.applyAuthDomStyles();

		const html = `
		<div class="kf-auth-card">
			<div class="kf-auth-tabs">
				<button type="button" data-mode="login" class="kf-tab ${defaultMode === "login" ? "active" : ""}">Login</button>
				<button type="button" data-mode="register" class="kf-tab ${defaultMode === "register" ? "active" : ""}">Register</button>
			</div>

			<div class="kf-field">
				<label>Email</label>
				<input type="email" name="email" placeholder="name@example.com" />
			</div>

			<div class="kf-field">
				<label>Password</label>
				<input type="password" name="password" placeholder="At least 6 characters" />
			</div>

			<div class="kf-field kf-username-row ${defaultMode === "register" ? "" : "hidden"}">
				<label>Username</label>
				<input type="text" name="username" placeholder="Your leaderboard name" maxlength="20" />
			</div>

			<div class="kf-message"></div>

			<div class="kf-actions">
				<button type="button" class="kf-primary">${defaultMode === "login" ? "Login" : "Create account"}</button>
			</div>
		</div>
	`;

		this.authDom = this.add.dom(cx, cy + 42).createFromHTML(html);
		this.authDom.setDepth(102);

		const node = this.authDom.node;
		let mode = defaultMode;

		const emailInput = node.querySelector('input[name="email"]');
		const passwordInput = node.querySelector('input[name="password"]');
		const usernameRow = node.querySelector(".kf-username-row");
		const usernameInput = node.querySelector('input[name="username"]');
		const tabs = [...node.querySelectorAll(".kf-tab")];
		const primaryBtn = node.querySelector(".kf-primary");
		const messageBox = node.querySelector(".kf-message");

		const setMode = (nextMode) => {
			mode = nextMode;

			tabs.forEach((tab) => {
				tab.classList.toggle("active", tab.dataset.mode === nextMode);
			});

			usernameRow.classList.toggle("hidden", nextMode !== "register");
			primaryBtn.textContent =
				nextMode === "login" ? "Login" : "Create account";
			messageBox.textContent = "";
		};

		tabs.forEach((tab) => {
			tab.addEventListener("click", () => {
				setMode(tab.dataset.mode);
			});
		});

		const finishLogin = async (user) => {
			const { data: profile } = await getProfile(user.id);

			const username =
				profile?.username ||
				user.user_metadata?.username ||
				user.email?.split("@")[0] ||
				"Player";

			this.registry.set("userId", user.id);
			this.registry.set("playerName", username);
			this.refreshAccountBar();
			this.closeOverlay();
		};

		primaryBtn.addEventListener("click", async () => {
			const email = emailInput.value.trim();
			const password = passwordInput.value.trim();
			const username = usernameInput.value.trim();

			if (!email || !password) {
				messageBox.textContent = "Please enter your email and password.";
				return;
			}

			if (mode === "register") {
				if (!username) {
					messageBox.textContent = "Please choose a username.";
					return;
				}

				if (username.length < 3) {
					messageBox.textContent = "Username must be at least 3 characters.";
					return;
				}
			}

			primaryBtn.disabled = true;
			messageBox.textContent =
				mode === "login" ? "Signing in..." : "Creating account...";

			try {
				if (mode === "login") {
					const { data, error } = await login(email, password);

					if (error) {
						messageBox.textContent = error.message || "Login failed.";
					} else if (data?.user) {
						await finishLogin(data.user);
					} else {
						messageBox.textContent =
							"Please confirm your email if required, then try again.";
					}
				} else {
					const { data, error } = await register(email, password, username);

					if (error) {
						const raw = (error.message || "").toLowerCase();

						if (
							raw.includes("already taken") ||
							raw.includes("duplicate key") ||
							raw.includes("unique")
						) {
							messageBox.textContent =
								"That username is already taken. Please choose another one.";
						} else if (raw.includes("rate limit")) {
							messageBox.textContent =
								"Too many email requests right now. Please wait a bit and try again.";
						} else {
							messageBox.textContent =
								error.message || "Could not create account.";
						}
					} else if (data?.user) {
						if (data.session) {
							await finishLogin(data.user);
						} else {
							messageBox.textContent =
								"Account created. Please confirm your email before signing in.";
						}
					} else {
						messageBox.textContent =
							"Account created. Please confirm your email before signing in.";
					}
				}
			} catch (error) {
				const raw = (error?.message || "").toLowerCase();

				if (
					raw.includes("already taken") ||
					raw.includes("duplicate key") ||
					raw.includes("unique")
				) {
					messageBox.textContent =
						"That username is already taken. Please choose another one.";
				} else if (raw.includes("rate limit")) {
					messageBox.textContent =
						"Too many email requests right now. Please wait a bit and try again.";
				} else {
					messageBox.textContent = error?.message || "Something went wrong.";
				}
			} finally {
				primaryBtn.disabled = false;
			}
		});
	}

	applyAuthDomStyles() {
		if (document.getElementById("kf-auth-styles")) return;

		const style = document.createElement("style");
		style.id = "kf-auth-styles";
		style.textContent = `
		.kf-auth-card {
			width: 450px;
			font-family: Georgia, serif;
			color: #f3ead1;
		}

		.kf-auth-tabs {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 16px;
			margin-bottom: 18px;
		}

		.kf-tab {
			padding: 12px 14px;
			border: 2px solid #d8c38c;
			background: #6d5030;
			color: #f8f1dc;
			cursor: pointer;
			font-size: 18px;
			transition: 0.15s ease;
			box-sizing: border-box;
		}

		.kf-tab:hover {
			filter: brightness(1.08);
		}

		.kf-tab.active {
			background: #8a673e;
		}

		.kf-field {
			display: flex;
			flex-direction: column;
			gap: 8px;
			margin-bottom: 14px;
		}

		.kf-field.hidden {
			display: none;
		}

		.kf-field label {
			font-size: 16px;
			color: #f1e8cf;
		}

		.kf-field input {
			width: 100%;
			box-sizing: border-box;
			padding: 12px 14px;
			font-size: 17px;
			border: 2px solid #d8c38c;
			background: #ece6d6;
			color: #1a120c;
			outline: none;
		}

		.kf-field input:focus {
			border-color: #f0dfb0;
			box-shadow: 0 0 0 2px rgba(240, 223, 176, 0.15);
		}

		.kf-message {
			min-height: 42px;
			margin: 10px 0 14px;
			padding: 8px 10px;
			font-size: 14px;
			line-height: 1.4;
			text-align: center;
			color: #ffe2b3;
			background: rgba(255, 255, 255, 0.03);
			border: 1px solid rgba(216, 195, 140, 0.2);
			box-sizing: border-box;
		}

		.kf-message:empty {
			background: transparent;
			border: none;
			padding: 0;
			min-height: 18px;
		}

		.kf-actions {
			margin-top: 4px;
		}

		.kf-primary {
			width: 100%;
			box-sizing: border-box;
			padding: 14px;
			font-size: 18px;
			cursor: pointer;
			border: 2px solid #d8c38c;
			background: #7b2626;
			color: white;
			transition: 0.15s ease;
		}

		.kf-primary:hover {
			filter: brightness(1.08);
		}

		.kf-primary:disabled {
			opacity: 0.65;
			cursor: default;
		}
	`;
		document.head.appendChild(style);
	}

	closeOverlay() {
		this.activeOverlay = null;

		if (this.overlayBlocker) {
			this.overlayBlocker.destroy();
			this.overlayBlocker = null;
		}

		if (this.settingsContainer) {
			this.settingsContainer.destroy(true);
			this.settingsContainer = null;
		}

		if (this.leaderboardContainer) {
			this.leaderboardContainer.destroy(true);
			this.leaderboardContainer = null;
		}

		if (this.authDom) {
			this.authDom.destroy();
			this.authDom = null;
		}

		if (this.authContainer) {
			this.authContainer.destroy(true);
			this.authContainer = null;
		}
	}

	makeMiniButton(x, y, label, onClick) {
		const bg = this.add
			.rectangle(x, y, 42, 42, 0x2e2217, 1)
			.setStrokeStyle(2, 0xf0dfb0)
			.setInteractive({ useHandCursor: true });

		const text = this.add
			.text(x, y, label, {
				fontFamily: "Georgia, serif",
				fontSize: "28px",
				color: "#ffffff",
			})
			.setOrigin(0.5);

		bg.on("pointerover", () => bg.setFillStyle(0x4a3623, 1));
		bg.on("pointerout", () => bg.setFillStyle(0x2e2217, 1));
		bg.on("pointerdown", onClick);

		return [bg, text];
	}

	roundVolume(value) {
		return Math.round(value * 10) / 10;
	}

	update(_, dt) {
		const d = dt / 16.666;

		this.bg.forEach((layer) => {
			layer.images.forEach((img) => {
				img.x -= layer.speed * d;

				if (img.x <= -settings.gameWidth) {
					img.x += settings.gameWidth * 2;
				}
			});
		});
	}
}
