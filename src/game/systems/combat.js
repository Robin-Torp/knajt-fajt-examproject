import Phaser from "phaser";
import { spawnHitEffect, hitPause, screenShake } from "./effects";

function isAttackFromFront(attacker, defender) {
	if (defender.facing === "right") {
		return attacker.x > defender.x;
	}

	if (defender.facing === "left") {
		return attacker.x < defender.x;
	}

	return false;
}

function getBodyRect(fighter) {
	return new Phaser.Geom.Rectangle(
		fighter.body.x,
		fighter.body.y,
		fighter.body.width,
		fighter.body.height,
	);
}

function getHitboxRect(fighter) {
	if (!fighter.attackHitbox?.body) return null;

	return new Phaser.Geom.Rectangle(
		fighter.attackHitbox.body.x,
		fighter.attackHitbox.body.y,
		fighter.attackHitbox.body.width,
		fighter.attackHitbox.body.height,
	);
}

function hitboxHitsBody(attacker, defender) {
	const hitbox = getHitboxRect(attacker);
	if (!hitbox || !defender.body) return false;

	const body = getBodyRect(defender);

	return Phaser.Geom.Intersects.RectangleToRectangle(hitbox, body);
}

function hitboxHitsHitbox(fighterA, fighterB) {
	const hitboxA = getHitboxRect(fighterA);
	const hitboxB = getHitboxRect(fighterB);

	if (!hitboxA || !hitboxB) return false;

	return Phaser.Geom.Intersects.RectangleToRectangle(hitboxA, hitboxB);
}

export function resolveCombat(scene, fighterA, fighterB) {
	const aCanHit =
		!fighterA.isDead &&
		fighterA.isAttacking &&
		fighterA.attackActive &&
		!fighterA.attackDidHit;

	const bCanHit =
		!fighterB.isDead &&
		fighterB.isAttacking &&
		fighterB.attackActive &&
		!fighterB.attackDidHit;

	const clash = aCanHit && bCanHit && hitboxHitsHitbox(fighterA, fighterB);

	if (clash) {
		const midX = (fighterA.attackHitbox.x + fighterB.attackHitbox.x) / 2;
		const midY = (fighterA.attackHitbox.y + fighterB.attackHitbox.y) / 2;

		spawnHitEffect(scene, midX, midY);
		hitPause(scene, 50);
		screenShake(scene, 110, 0.005);

		fighterA.attackDidHit = true;
		fighterB.attackDidHit = true;

		scene.time.delayedCall(50, () => {
			const leftFighter = fighterA.x <= fighterB.x ? fighterA : fighterB;
			const rightFighter = fighterA.x <= fighterB.x ? fighterB : fighterA;

			if (!leftFighter.isDead) {
				leftFighter.clashPush(-1);
			}

			if (!rightFighter.isDead) {
				rightFighter.clashPush(1);
			}
		});

		return { clash: true, winner: null };
	}

	const aHits =
		aCanHit &&
		!fighterB.hasIFrames &&
		!fighterB.isDashing &&
		hitboxHitsBody(fighterA, fighterB);

	const bHits =
		bCanHit &&
		!fighterA.hasIFrames &&
		!fighterA.isDashing &&
		hitboxHitsBody(fighterB, fighterA);

	if (aHits) {
		if (fighterB.isGuarding && isAttackFromFront(fighterA, fighterB)) {
			return { clash: false, winner: null };
		}

		fighterA.attackDidHit = true;

		spawnHitEffect(scene, fighterB.x, fighterB.y - 10);
		hitPause(scene, 200);
		screenShake(scene, 90, 0.004);

		const launchDir = fighterA.x < fighterB.x ? 1 : -1;

		scene.time.delayedCall(40, () => {
			if (!fighterB.isDead) {
				fighterB.launch(launchDir, 340, 260);
			}
		});

		return { clash: false, winner: "A" };
	}

	if (bHits) {
		if (fighterA.isGuarding && isAttackFromFront(fighterB, fighterA)) {
			return { clash: false, winner: null };
		}

		fighterB.attackDidHit = true;

		spawnHitEffect(scene, fighterA.x, fighterA.y - 10);
		hitPause(scene, 200);
		screenShake(scene, 90, 0.004);

		const launchDir = fighterB.x < fighterA.x ? 1 : -1;

		scene.time.delayedCall(40, () => {
			if (!fighterA.isDead) {
				fighterA.launch(launchDir, 340, 260);
			}
		});

		return { clash: false, winner: "B" };
	}

	return { clash: false, winner: null };
}
