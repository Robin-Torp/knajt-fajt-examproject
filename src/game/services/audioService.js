let currentMusic = null;
let currentMusicKey = null;

const MUSIC_BALANCE = {
	"bgm-menu": 0.45,
	"bgm-fight": 1.0,
};

function getMusicVolume(scene, key) {
	const userVolume = scene.registry.get("musicVolume") ?? 0.6;
	const balance = MUSIC_BALANCE[key] ?? 1;
	return userVolume * balance;
}

export function playMusic(scene, key) {
	const volume = getMusicVolume(scene, key);

	if (currentMusic && currentMusicKey === key && currentMusic.isPlaying) {
		currentMusic.setVolume(volume);
		return;
	}

	stopMusic();

	currentMusic = scene.sound.add(key, {
		loop: true,
		volume,
	});

	currentMusicKey = key;
	currentMusic.play();
}

export function stopMusic() {
	if (currentMusic) {
		currentMusic.stop();
		currentMusic.destroy();
		currentMusic = null;
		currentMusicKey = null;
	}
}

export function updateMusicVolume(scene) {
	if (currentMusic && currentMusicKey) {
		currentMusic.setVolume(getMusicVolume(scene, currentMusicKey));
	}
}

export function playSFX(scene, key, extra = {}) {
	const volume = scene.registry.get("sfxVolume") ?? 0.8;

	scene.sound.play(key, {
		volume,
		...extra,
	});
}
