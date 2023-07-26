import { toggleShortcutCheatsheet } from "../../../shortcuts/Shortcut";
import { ShortcutsExperiment } from "../../../shortcuts/ShortcutsExperiment";
import { FilterBarController } from "../ui/experiment/filter/FilterBarController";
import { getExperimentCy } from "../ui/graph/CytoscapeFabric";
import { FilterManager } from "../ui/experiment/filter/Filter";
import { ExperimentGraphController } from "../ui/experiment/graph/ExperimentGraphController";
import { SearchViewController } from "../ui/experiment/search/SearchController";
import { ExperimentStarter } from "./startExperiment";
import { SelectionTypeIndicatorController } from "../ui/shared/selectionTypeIndicator/SelectionTypeIndicatorController";
import { studyEventBus, StudyEvent } from "../../../shared/study/StudyEventBus";

export const onStartExperimentCondition = (
	elements: any,
	app: HTMLDivElement
): ExperimentStarter => {
	document.addEventListener("keydown", (event) => {
		if (event.key === "?") {
			toggleShortcutCheatsheet(ShortcutsExperiment);
		}
	});

	studyEventBus.addListener(StudyEvent.TASK_HELP, () =>
		toggleShortcutCheatsheet(ShortcutsExperiment)
	);

	const cy = getExperimentCy(elements),
		filterManager = new FilterManager(cy);

	const graphController = new ExperimentGraphController(cy);
	const searchController = new SearchViewController(cy);
	const filterController = new FilterBarController(cy, filterManager);
	const selectionTypeIndicatorController =
		new SelectionTypeIndicatorController();

	const toggleControllers = (on = true) => {
		graphController.toggle(on);
		searchController.toggle(on);
		filterController.toggle(on);

		app.classList.toggle("disabled", !on);
	};

	const resetControllers = () => {
		graphController.reset();
		searchController.reset();
		filterController.reset();
	};

	return {
		cy,
		toggleControllers,
		resetControllers,
	};
};
