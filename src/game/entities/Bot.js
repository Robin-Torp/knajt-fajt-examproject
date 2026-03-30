import { Fighter } from "./Fighter";
import { runBotAI } from "../systems/botAI";

export class Bot extends Fighter {
	constructor(scene, x, y, config, target) {
		super(scene, x, y, config);
		this.target = target;
		this.aiProfile = "medium";
	}

	update(time) {
		if (this.scene.isMatchStarting) {
			this.stop();
			this.stopGuard();
			return;
		}

		if (this.isDead) return;

		runBotAI(this, this.target, time);
	}
}
