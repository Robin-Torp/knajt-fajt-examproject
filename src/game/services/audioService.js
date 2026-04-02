// audioService samlar logik för musik och ljudeffekter.
// Den håller reda på aktiv musik, balanserar volym mellan olika låtar
// och använder registry-värden för spelarens ljudinställningar.

let currentMusic = null;
let currentMusicKey = null;

// Olika musikspår kan behöva lite olika grundnivå för att upplevas jämna.
const MUSIC_BALANCE = {
	"bgm-menu": 0.2,
	"bgm-fight": 0.4,
};

// Slår ihop spelarens valda volym med låtens egen balansfaktor.
function getMusicVolume(scene, key) {
	const userVolume = scene.registry.get("musicVolume") ?? 0.5;
	const balance = MUSIC_BALANCE[key] ?? 1;
	return userVolume * balance;
}

// Startar musikspåret eller uppdaterar volymen om samma låt redan spelas.
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

// Stoppar och rensar nuvarande musik helt.
export function stopMusic() {
	if (currentMusic) {
		currentMusic.stop();
		currentMusic.destroy();
		currentMusic = null;
		currentMusicKey = null;
	}
}

// Används när spelaren ändrar musikvolym medan ett spår redan spelas.
export function updateMusicVolume(scene) {
	if (currentMusic && currentMusicKey) {
		currentMusic.setVolume(getMusicVolume(scene, currentMusicKey));
	}
}

// Spelar en ljudeffekt och låter anropet skicka med extra inställningar vid behov.
export function playSFX(scene, key, extra = {}) {
	const volume = scene.registry.get("sfxVolume") ?? 0.5;

	scene.sound.play(key, {
		volume,
		...extra,
	});
}
