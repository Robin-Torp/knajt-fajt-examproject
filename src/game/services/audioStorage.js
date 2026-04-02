// audioStorage sparar och läser ljudinställningar i localStorage.
// På så sätt kan spelarens musik- och SFX-volym finnas kvar
// mellan olika sidladdningar.

const AUDIO_KEY = "knajt-fajt-audio";

// Läser tidigare sparade volymer och faller tillbaka till standardvärden om något saknas.
export function loadAudioSettings() {
	try {
		const raw = localStorage.getItem(AUDIO_KEY);
		if (!raw) {
			return {
				musicVolume: 0.5,
				sfxVolume: 0.5,
			};
		}

		const parsed = JSON.parse(raw);

		return {
			musicVolume: Number.isFinite(parsed.musicVolume)
				? parsed.musicVolume
				: 0.5,
			sfxVolume: Number.isFinite(parsed.sfxVolume) ? parsed.sfxVolume : 0.5,
		};
	} catch {
		return {
			musicVolume: 0.5,
			sfxVolume: 0.5,
		};
	}
}

// Sparar nästa ljudinställningar i localStorage.
export function saveAudioSettings(nextSettings) {
	localStorage.setItem(AUDIO_KEY, JSON.stringify(nextSettings));
}
