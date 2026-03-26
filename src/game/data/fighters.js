import { settings } from "./settings";

export const fighters = {
	player: {
		texture: "player",
		speed: settings.playerSpeed,
		jumpForce: settings.jumpForce,
		name: "P1",
		uiColor: "#0f6c4f",
	},

	botEasy: {
		texture: "bot",
		speed: settings.botSpeed,
		jumpForce: settings.jumpForce,
		name: "BOT",
		uiColor: "#ff6b6b",
	},
};
