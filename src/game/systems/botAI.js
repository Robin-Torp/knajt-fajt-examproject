function getStageBounds(bot) {
	const stage = bot.scene.currentStage;
	const ground = stage?.ground?.[0];

	if (!ground) {
		return {
			left: 0,
			right: bot.scene.scale.width,
		};
	}

	const tileSize = 32;
	const left = ground.xTiles * tileSize;
	const right = left + ground.widthTiles * tileSize;

	return { left, right };
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(value) {
	return Math.random() < value;
}

const BOT_PERSONALITIES = {
	medium: {
		thinkMin: 100,
		thinkMax: 170,
		attackCooldownMin: 720,
		attackCooldownMax: 920,
		attackChanceClose: 0.36,
		attackChanceScramble: 0.24,
		jumpInChanceMid: 0.22,
		jumpInChanceClose: 0.14,
		retreatChanceMid: 0.28,
		retreatChanceClose: 0.3,
		retreatChanceTooClose: 0.44,
		guardChanceMid: 0.12,
		guardTimeMin: 90,
		guardTimeMax: 150,
		dashInChanceFar: 0.16,
		dashInChanceMid: 0.1,
		holdChanceMid: 0.18,
		holdChanceClose: 0.16,
		microStepChanceMid: 0.26,
		microStepChanceClose: 0.2,
		jumpAttackDelayMin: 100,
		jumpAttackDelayMax: 160,
		nextJumpInDelayMin: 1300,
		nextJumpInDelayMax: 2100,
		turnLockMs: 155,
	},
};

function getBotPersonality(bot) {
	const key = bot.aiProfile || "medium";
	return BOT_PERSONALITIES[key] || BOT_PERSONALITIES.medium;
}

function initMemory(bot, dx) {
	if (bot.aiState == null) bot.aiState = "idle";
	if (bot.aiThinkAt == null) bot.aiThinkAt = 0;
	if (bot.aiAttackAt == null) bot.aiAttackAt = 0;
	if (bot.aiGuardUntil == null) bot.aiGuardUntil = 0;
	if (bot.aiRetreatUntil == null) bot.aiRetreatUntil = 0;
	if (bot.aiMicroUntil == null) bot.aiMicroUntil = 0;
	if (bot.aiJumpAttackAt == null) bot.aiJumpAttackAt = 0;
	if (bot.aiNextJumpInAt == null) bot.aiNextJumpInAt = 0;
	if (bot.aiTurnLockUntil == null) bot.aiTurnLockUntil = 0;
	if (bot.aiLastTargetSide == null) bot.aiLastTargetSide = dx >= 0 ? 1 : -1;
}

function moveToward(bot, dx, time) {
	if (dx < 0) bot.moveLeft(time);
	else bot.moveRight(time);
}

function moveAway(bot, dx, time) {
	if (dx < 0) bot.moveRight(time);
	else bot.moveLeft(time);
}

function tryGroundAttack(bot, time, personality) {
	if (time < bot.aiAttackAt) return false;
	if (bot.isAttacking || bot.isDashing || bot.isGuarding) return false;

	bot.stop();

	const started = bot.startAttack();
	bot.aiAttackAt = started
		? time +
			randInt(personality.attackCooldownMin, personality.attackCooldownMax)
		: time + 120;

	return started;
}

function tryJumpIn(bot, dx, time, personality) {
	if (!bot.body.blocked.down) return false;
	if (time < bot.aiNextJumpInAt) return false;

	bot.jump();
	moveToward(bot, dx, time);

	bot.aiJumpAttackAt =
		time +
		randInt(personality.jumpAttackDelayMin, personality.jumpAttackDelayMax);

	bot.aiNextJumpInAt =
		time +
		randInt(personality.nextJumpInDelayMin, personality.nextJumpInDelayMax);

	return true;
}

export function runBotAI(bot, target, time) {
	if (!bot.body || !target || bot.isDead || target.isDead) {
		bot.stop();
		bot.stopGuard();
		return;
	}

	const personality = getBotPersonality(bot);

	const dx = target.x - bot.x;
	const dy = target.y - bot.y;
	const absX = Math.abs(dx);
	const sameHeight = Math.abs(dy) < 75;

	initMemory(bot, dx);

	const currentTargetSide = dx >= 0 ? 1 : -1;
	if (currentTargetSide !== bot.aiLastTargetSide) {
		bot.aiLastTargetSide = currentTargetSide;
		bot.aiTurnLockUntil = time + personality.turnLockMs;
	}

	const { left, right } = getStageBounds(bot);
	const edgeBuffer = 48;
	const nearLeftEdge = bot.x <= left + edgeBuffer;
	const nearRightEdge = bot.x >= right - edgeBuffer;

	if (time >= bot.aiTurnLockUntil) {
		bot.faceTarget(target);
	}

	if (bot.isAttacking || bot.isDashing || bot.isClashing) {
		return;
	}

	if (
		bot.aiJumpAttackAt > 0 &&
		time >= bot.aiJumpAttackAt &&
		!bot.isAttacking &&
		!bot.isGuarding &&
		!bot.isDashing
	) {
		bot.startAttack();
		bot.aiJumpAttackAt = 0;
		bot.aiAttackAt =
			time +
			randInt(personality.attackCooldownMin, personality.attackCooldownMax);
		return;
	}

	if (time < bot.aiGuardUntil) {
		bot.startGuard();
		bot.stop();
		return;
	} else {
		bot.stopGuard();
	}

	if (time < bot.aiRetreatUntil) {
		moveAway(bot, dx, time);
		return;
	}

	if (time < bot.aiMicroUntil) {
		moveToward(bot, dx, time);
		return;
	}

	if (nearLeftEdge) {
		bot.moveRight(time);
		bot.aiState = "recover";
		return;
	}

	if (nearRightEdge) {
		bot.moveLeft(time);
		bot.aiState = "recover";
		return;
	}

	if (dy < -95 && bot.body.blocked.down && time >= bot.aiThinkAt) {
		bot.aiThinkAt = time + randInt(personality.thinkMin, personality.thinkMax);
		bot.jump();
		bot.aiState = "anti-air-follow";
		return;
	}

	if (time < bot.aiThinkAt) {
		return;
	}

	bot.aiThinkAt = time + randInt(personality.thinkMin, personality.thinkMax);

	const farRange = absX > 120;
	const midRange = absX > 70 && absX <= 120;
	const closeRange = absX >= 34 && absX <= 70;
	const tooClose = absX < 34;

	if (farRange) {
		if (bot.canDash && chance(personality.dashInChanceFar)) {
			const dir = dx < 0 ? -1 : 1;
			bot.dash(dir);
			bot.aiState = "dash-in";
			return;
		}

		moveToward(bot, dx, time);
		bot.aiState = "approach";
		return;
	}

	if (midRange && sameHeight) {
		if (
			chance(personality.jumpInChanceMid) &&
			tryJumpIn(bot, dx, time, personality)
		) {
			bot.aiState = "jump-in";
			return;
		}

		if (chance(personality.retreatChanceMid)) {
			bot.aiRetreatUntil = time + randInt(90, 150);
			moveAway(bot, dx, time);
			bot.aiState = "bait-retreat";
			return;
		}

		if (chance(personality.guardChanceMid)) {
			bot.aiGuardUntil =
				time + randInt(personality.guardTimeMin, personality.guardTimeMax);
			bot.aiState = "guard";
			return;
		}

		if (bot.canDash && chance(personality.dashInChanceMid)) {
			const dir = dx < 0 ? -1 : 1;
			bot.dash(dir);
			bot.aiState = "dash-mid";
			return;
		}

		if (chance(personality.microStepChanceMid)) {
			bot.aiMicroUntil = time + randInt(80, 130);
			moveToward(bot, dx, time);
			bot.aiState = "micro-step";
			return;
		}

		if (chance(personality.holdChanceMid)) {
			bot.stop();
			bot.aiState = "hold-mid";
			return;
		}

		moveToward(bot, dx, time);
		bot.aiState = "walk-in";
		return;
	}

	if (closeRange && sameHeight) {
		if (
			chance(personality.attackChanceClose) &&
			tryGroundAttack(bot, time, personality)
		) {
			bot.aiState = "attack";
			return;
		}

		if (
			chance(personality.jumpInChanceClose) &&
			tryJumpIn(bot, dx, time, personality)
		) {
			bot.aiState = "jump-close";
			return;
		}

		if (chance(personality.retreatChanceClose)) {
			bot.aiRetreatUntil = time + randInt(75, 130);
			moveAway(bot, dx, time);
			bot.aiState = "bait-close";
			return;
		}

		if (chance(personality.microStepChanceClose)) {
			bot.aiMicroUntil = time + randInt(60, 110);
			moveToward(bot, dx, time);
			bot.aiState = "micro-pressure";
			return;
		}

		if (chance(personality.holdChanceClose)) {
			bot.stop();
			bot.aiState = "hold-close";
			return;
		}

		moveToward(bot, dx, time);
		bot.aiState = "close-walk";
		return;
	}

	if (tooClose) {
		if (chance(personality.retreatChanceTooClose)) {
			bot.aiRetreatUntil = time + randInt(70, 120);
			moveAway(bot, dx, time);
			bot.aiState = "reset-space";
			return;
		}

		if (
			chance(personality.attackChanceScramble) &&
			tryGroundAttack(bot, time, personality)
		) {
			bot.aiState = "scramble-attack";
			return;
		}

		bot.stop();
		bot.aiState = "scramble-hold";
		return;
	}

	bot.stop();
	bot.aiState = "idle";
}
