export function runBotAI(bot, target) {
	const distanceX = target.x - bot.x;
	const distanceY = target.y - bot.y;

	if (Math.abs(distanceX) > 55) {
		if (distanceX < 0) {
			bot.moveLeft();
		} else {
			bot.moveRight();
		}
	} else {
		bot.stop();
	}

	if (distanceY < -50 && bot.body.blocked.down) {
		bot.jump();
	}
}
