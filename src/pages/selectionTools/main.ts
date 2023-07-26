import "./style.css";
import StorageManager from "../../shared/study/StorageManager";
import "tippy.js/dist/tippy.css";
import { getExperimentCy } from "./ui/graph/CytoscapeFabric";
import { FilterManager } from "./ui/experiment/filter/Filter";
import { getElements } from "./global/DataManager";
import { onStartExperimentCondition } from "./loadLogic/startExperimentCondition";
import { onStartControlCondition } from "./loadLogic/startControlCondition";

const main = async () => {
	const storageManager = new StorageManager();
	await storageManager.init();

	const elements = await getElements(),
		cy = getExperimentCy(elements),
		experimentApp = document.getElementById("experiment-app") as HTMLDivElement,
		controlApp = document.getElementById("control-app") as HTMLDivElement;

	experimentApp.style.display = "none";
	controlApp.style.display = "none";

	const startExperimentButton = document.createElement("button");
	const startControlButton = document.createElement("button");

	startExperimentButton.innerHTML = "Start Experiment Prototype";
	startExperimentButton.onclick = () => {
		startExperimentButton.remove();
		startControlButton.remove();

		experimentApp.style.display = "flex";
		const { resetControllers, toggleControllers } = onStartExperimentCondition(
			elements,
			experimentApp
		);
		resetControllers();
		toggleControllers(true);
	};
	document.body.appendChild(startExperimentButton);

	startControlButton.innerHTML = "Start Control Prototype";
	startControlButton.onclick = () => {
		startExperimentButton.remove();
		startControlButton.remove();

		controlApp.style.display = "flex";
		const { resetControllers, toggleControllers } = onStartControlCondition(
			elements,
			controlApp
		);
		resetControllers();
		toggleControllers(true);
	};
	document.body.appendChild(startControlButton);
};

main();
