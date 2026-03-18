import Phaser from "phaser";

function isAttackFromFront(attacker, defender) {
	if (defender.facing === "right") {
		return attacker.x > defender.x;
	}

	if (defender.facing === "left") {
		return attacker.x < defender.x;
	}

	return false;
}

export function tryAttack(attacker, defender) {
	if (attacker.isDead || defender.isDead) return false;

	if (!attacker.isAttacking || !attacker.attackActive) {
		return false;
	}

	if (attacker.attackDidHit) {
		return false;
	}

	if (defender.hasIFrames || defender.isDashing) {
		return false;
	}

	if (!attacker.attackHitbox?.body) {
		return false;
	}

	const attackerBounds = new Phaser.Geom.Rectangle(
		attacker.attackHitbox.body.x,
		attacker.attackHitbox.body.y,
		attacker.attackHitbox.body.width,
		attacker.attackHitbox.body.height,
	);

	const defenderBounds = new Phaser.Geom.Rectangle(
		defender.body.x,
		defender.body.y,
		defender.body.width,
		defender.body.height,
	);

	const hit = Phaser.Geom.Intersects.RectangleToRectangle(
		attackerBounds,
		defenderBounds,
	);

	if (!hit) return false;

	if (defender.isGuarding) {
		const blocked = isAttackFromFront(attacker, defender);
		if (blocked) {
			return false;
		}
	}

	attacker.attackDidHit = true;
	defender.die();
	return true;
}
