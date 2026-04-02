// BootScene är den första scenen som körs.
// Den gör nästan inget mer än att skicka spelaren vidare till preload,
// så att assets och animationer kan laddas innan menyn visas.

export class BootScene extends Phaser.Scene {
	constructor() {
		super("BootScene");
	}

	// När BootScene är klar hoppar vi direkt vidare till preload.
	create() {
		this.scene.start("PreloadScene");
	}
}
