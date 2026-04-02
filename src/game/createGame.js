import Phaser from "phaser";
import { gameConfig } from "./config";

// Liten hjälpfunktion som skapar ett nytt Phaser-spel
// utifrån konfigurationen i config.js.

// Skapar och returnerar en Phaser-instans.
export function createGame(parent) {
	return new Phaser.Game(gameConfig(parent));
}
