const AUDIO_KEY = "knajt-fajt-audio";

export function loadAudioSettings() {
	try {
		const raw = localStorage.getItem(AUDIO_KEY);
		if (!raw) {
			return {
				musicVolume: 0.6,
				sfxVolume: 0.8,
			};
		}

		const parsed = JSON.parse(raw);

		return {
			musicVolume: Number.isFinite(parsed.musicVolume)
				? parsed.musicVolume
				: 0.6,
			sfxVolume: Number.isFinite(parsed.sfxVolume) ? parsed.sfxVolume : 0.8,
		};
	} catch {
		return {
			musicVolume: 0.6,
			sfxVolume: 0.8,
		};
	}
}

export function saveAudioSettings(nextSettings) {
	localStorage.setItem(AUDIO_KEY, JSON.stringify(nextSettings));
}
