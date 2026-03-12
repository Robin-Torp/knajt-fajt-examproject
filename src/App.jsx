import Game from "./components/game";
import Hud from "./components/Hud";

function App() {
	return (
		<div className="app">
			<h1>Knajt Fajt</h1>
			<Hud />
			<Game />
		</div>
	);
}

export default App;
