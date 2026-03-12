import Phaser from "phaser";
import { gameConfig } from "./config";

export function createGame(parent) {
	return new Phaser.Game(gameConfig(parent));
}
