function isAttackFromFront(attacker, defender) {
	if (defender.facing === "right") {
		return attacker.x > defender.x;
	}

	if (defender.facing === "left") {
		return attacker.x < defender.x;
	}

	return false;
}

export function tryAttack(attacker, defender, range = 70) {
	if (attacker.isDead || defender.isDead) return false;

	if (defender.hasIFrames) {
		return false;
	}

	const isFacingTarget =
		(attacker.facing === "right" && defender.x > attacker.x) ||
		(attacker.facing === "left" && defender.x < attacker.x);

	const distanceX = Math.abs(defender.x - attacker.x);
	const distanceY = Math.abs(defender.y - attacker.y);

	if (!isFacingTarget || distanceX > range || distanceY >= 50) {
		return false;
	}

	if (defender.isGuarding) {
		const blocked = isAttackFromFront(attacker, defender);

		if (blocked) {
			return false;
		}
	}

	defender.die();
	return true;
}
