export function runBotAI(bot, target, time) {
	const distanceX = target.x - bot.x;
	const distanceY = target.y - bot.y;
	const absX = Math.abs(distanceX);

	bot.stopGuard();

	if (absX > 60) {
		if (distanceX < 0) {
			bot.moveLeft();
		} else {
			bot.moveRight();
		}
	} else {
		bot.stop();

		if (time % 1200 < 150) {
			bot.startGuard();
		}
	}

	if (distanceY < -60 && bot.body.blocked.down) {
		bot.jump();
	}
}
