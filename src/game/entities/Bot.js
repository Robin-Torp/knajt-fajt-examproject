import { Fighter } from "./Fighter";
import { runBotAI } from "../systems/botAI";

export class Bot extends Fighter {
	constructor(scene, x, y, config, target) {
		super(scene, x, y, config);
		this.target = target;
		this.attackCooldown = 0;
	}

	update(time) {
		if (this.isDead) return;
		runBotAI(this, this.target, time);
	}

	wantsToAttack(time) {
		if (this.isDead || this.isGuarding || this.isDashing) return false;

		const distanceX = Math.abs(this.target.x - this.x);
		const distanceY = Math.abs(this.target.y - this.y);

		if (time > this.attackCooldown && distanceX < 65 && distanceY < 50) {
			this.attackCooldown = time + 700;
			return true;
		}

		return false;
	}
}
