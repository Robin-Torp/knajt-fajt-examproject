import Game from "./components/Game";
import Hud from "./components/Hud";

function App() {
	return (
		<section className="app">
			<Hud />
			<Game />

			<section className="info-panel">
				<section className="controls">
					<h2>CONTROLS</h2>

					<p>
						<b>A / D</b> - Move left and right
					</p>
					<p>
						<b>W</b> - Jump (press again in air to double jump)
					</p>
					<p>
						<b>SHIFT + A / D</b> - Dash
					</p>
					<p>
						<b>S</b> - Fast fall (in air)
					</p>
					<p>
						<b>J</b> - Attack (can be used in air)
					</p>
					<p>
						<b>K</b> - Shield (can still be hit from behind)
					</p>
					<p>
						<b>ESC</b> - To pause the game
					</p>
				</section>

				<section className="assets">
					<h2>ASSETS</h2>

					<ul>
						<li>
							<a
								href="https://gandalfhardcore.itch.io/2d-pixel-art-male-and-female-character"
								target="_blank">
								Characters
							</a>
						</li>
						<li>
							<a
								href="https://gandalfhardcore.itch.io/free-pixel-art-sidescroller-asset-pack-32x32-overworld"
								target="_blank">
								Environment
							</a>
						</li>
						<li>
							<a
								href="https://fablefly-music.itch.io/daydream-of-a-deity"
								target="_blank">
								Music
							</a>
						</li>
						<li>
							<a
								href="https://leohpaz.itch.io/minifantasy-dungeon-sfx-pack"
								target="_blank">
								SFX
							</a>
						</li>
						<li>
							<a
								href="https://www.1001fonts.com/canterbury-font.html"
								target="_blank">
								Canterbury Font
							</a>
						</li>
						<li>
							<a
								href="https://www.1001fonts.com/yoster-island-font.html"
								target="_blank">
								Yoster Island Font
							</a>
						</li>
					</ul>
				</section>
			</section>
		</section>
	);
}

export default App;
