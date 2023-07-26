import cytoscape from "cytoscape-select";
import { toggleShortcutCheatsheet } from "../../../shortcuts/Shortcut";
import { ShortcutsControl } from "../../../shortcuts/ShortcutsControl";
import { ExperimentStarter } from "./startExperiment";
import { getControlCy, getExperimentCy } from "../ui/graph/CytoscapeFabric";
import { ControlGraphController } from "../ui/control/graph/ControlGraphController";
import { ActionBarController } from "../ui/control/actionBar/ActionBarController";
import { SelectionTypeIndicatorController } from "../ui/shared/selectionTypeIndicator/SelectionTypeIndicatorController";
import { StudyEvent, studyEventBus } from "../../../shared/study/StudyEventBus";

export const onStartControlCondition = (
	elements: any,
	app: HTMLDivElement
): ExperimentStarter => {
	document.addEventListener("keydown", (event) => {
		if (event.key === "?") {
			toggleShortcutCheatsheet(ShortcutsControl);
		}
	});

	const cy: cytoscape.Core = getControlCy(elements);
	const graphController = new ControlGraphController(cy),
		actionBarController = new ActionBarController(cy),
		selectionTypeIndicatorController = new SelectionTypeIndicatorController();

	const toggleControllers = (on = true) => {
		graphController.toggle(on);
		actionBarController.toggle(on);
		selectionTypeIndicatorController.toggle(on);
		app.classList.toggle("disabled", !on);
	};
	const resetControllers = () => {
		graphController.reset();
		actionBarController.reset();
		selectionTypeIndicatorController.reset();
	};

	return {
		cy,
		toggleControllers,
		resetControllers,
	};
};
