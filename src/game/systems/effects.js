// Små visuella och effekter som används i strid.
// De här funktionerna gör att träffar känns tydligare genom flash,
// kort paus i fysiken och kameraskakning.

// Enkel träffeffekt med ring och flash.
export function spawnHitEffect(scene, x, y) {
	const ring = scene.add.circle(x, y, 14, 0xffffff, 0.95);
	const flash = scene.add.circle(x, y, 6, 0xffffaa, 1);

	ring.setDepth(100);
	flash.setDepth(101);

	scene.tweens.add({
		targets: ring,
		scale: 2.8,
		alpha: 0,
		duration: 160,
		onComplete: () => ring.destroy(),
	});

	scene.tweens.add({
		targets: flash,
		scale: 2,
		alpha: 0,
		duration: 100,
		onComplete: () => flash.destroy(),
	});
}

// Kort paus i fysiken gör att träffar känns tyngre.
export function hitPause(scene, duration = 40) {
	scene.physics.world.pause();

	scene.time.delayedCall(duration, () => {
		scene.physics.world.resume();
	});
}

// Skakar kameran lätt för att förstärka känslan av impact.
export function screenShake(scene, duration = 80, intensity = 0.003) {
	if (!scene?.cameras?.main) return;
	scene.cameras.main.shake(duration, intensity);
}
