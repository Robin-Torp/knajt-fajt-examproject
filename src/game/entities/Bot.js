import { Fighter } from "./Fighter";
import { runBotAI } from "../systems/botAI";

// Bot är motståndaren som styrs av AI.
// Den återanvänder all grundlogik från Fighter men uppdateras
// genom att kalla på runBotAI varje frame.

export class Bot extends Fighter {
	// Boten behöver ett mål att tänka mot, vanligtvis spelaren.
	constructor(scene, x, y, config, target) {
		super(scene, x, y, config);
		this.target = target;
		this.aiProfile = "medium";
	}

	// Om matchen är aktiv lämnas beslutet vidare till AI-systemet.
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
