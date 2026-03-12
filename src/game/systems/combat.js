export function tryAttack(attacker, defender, range = 70) {
	if (attacker.isDead || defender.isDead) return false;

	const isFacingTarget =
		(attacker.facing === "right" && defender.x > attacker.x) ||
		(attacker.facing === "left" && defender.x < attacker.x);

	const distanceX = Math.abs(defender.x - attacker.x);
	const distanceY = Math.abs(defender.y - attacker.y);

	if (isFacingTarget && distanceX <= range && distanceY < 50) {
		defender.die();
		return true;
	}

	return false;
}
