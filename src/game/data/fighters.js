import { settings } from "./settings";

export const fighters = {
	player: {
		texture: "player",
		speed: settings.playerSpeed,
		jumpForce: settings.jumpForce,
	},

	botEasy: {
		texture: "bot",
		speed: settings.botSpeed,
		jumpForce: settings.jumpForce,
	},
};
