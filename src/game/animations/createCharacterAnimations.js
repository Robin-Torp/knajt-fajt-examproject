export function createCharacterAnimations(scene, key) {
	const anims = scene.anims;

	const create = (config) => {
		if (!anims.exists(config.key)) {
			anims.create(config);
		}
	};

	const frames = (list) => list.map((frame) => ({ key, frame }));

	create({
		key: `${key}-idle`,
		frames: frames([0, 1, 2, 3, 4]),
		frameRate: 8,
		repeat: -1,
	});

	create({
		key: `${key}-run`,
		frames: frames([20, 21, 22, 23, 24, 25, 26, 27]),
		frameRate: 12,
		repeat: -1,
	});

	create({
		key: `${key}-jump`,
		frames: frames([30, 31, 32, 33]),
		frameRate: 10,
		repeat: 0,
	});

	create({
		key: `${key}-fall`,
		frames: frames([40, 41, 42, 43]),
		frameRate: 10,
		repeat: -1,
	});

	create({
		key: `${key}-attack`,
		frames: frames([50, 51, 52, 53, 54, 55]),
		frameRate: 10,
		repeat: 0,
	});

	create({
		key: `${key}-dash`,
		frames: frames([60, 61, 62, 63, 64, 65]),
		frameRate: 14,
		repeat: -1,
	});

	create({
		key: `${key}-death`,
		frames: frames([66, 67, 68, 69]),
		frameRate: 8,
		repeat: 0,
	});
}
