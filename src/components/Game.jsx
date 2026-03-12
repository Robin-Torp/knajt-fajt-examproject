import { useEffect, useRef } from "react";
import { createGame } from "../game/createGame";

function Game() {
	const gameRef = useRef(null);
	const phaserGame = useRef(null);

	useEffect(() => {
		if (!phaserGame.current) {
			phaserGame.current = createGame(gameRef.current);
		}

		return () => {
			if (phaserGame.current) {
				phaserGame.current.destroy(true);
				phaserGame.current = null;
			}
		};
	}, []);

	return <div id="game-container" ref={gameRef} />;
}

export default Game;
