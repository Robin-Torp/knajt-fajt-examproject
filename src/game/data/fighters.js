import { settings } from "./settings";

export const fighters = {
	player: {
		texture: "player",
		speed: settings.playerSpeed,
		jumpForce: settings.jumpForce,
		color: 0x4ecdc4,
	},
	botEasy: {
		texture: "bot",
		speed: settings.botSpeed,
		jumpForce: settings.jumpForce,
		color: 0xff6b6b,
	},
};
