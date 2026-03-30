import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/game.css";

async function startApp() {
	try {
		await document.fonts.load('32px "Canterbury"');
	} catch (error) {
		console.warn("Could not preload Canterbury font", error);
	}

	ReactDOM.createRoot(document.getElementById("root")).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
}

startApp();
