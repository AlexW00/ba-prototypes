import {
	getCyElementsByIds,
	getNeighbors,
} from "../../../pages/selectionTools/ui/graph/CytoscapeElements";
import { ConditionInfo } from "../Models/ExperimentModel";
import { SelectDependenciesTaskModel } from "../Models/TaskModel";
import { Task } from "./Task";
import cytoscape from "cytoscape-select";

export class SelectDependenciesTask
	extends Task
	implements SelectDependenciesTaskModel
{
	rootElementIds: string[];

	constructor(
		model: SelectDependenciesTaskModel,
		conditionInfo: ConditionInfo,
		cy: cytoscape.Core,
		[relativeIndex, absoluteIndex]: [number, number]
	) {
		super(model, conditionInfo, cy, [relativeIndex, absoluteIndex]);
		this.rootElementIds = model.rootElementIds;
	}

	public getDescription(): string {
		const labels = getCyElementsByIds(this.rootElementIds, this.cy).map(
			(element) => {
				return `"${element.data()?.label}"`;
			}
		);
		const isPlural = labels.length > 1;

		return isPlural
			? `die Knoten ${labels.join(", ")} und ihre Nachbarn`
			: `den Knoten ${labels.join(", ")} und seine Nachbarn`;
	}

	getTitle(): string {
		return "Nachbarn";
	}

	getProgress(): [number, number, number] {
		const rootElements = getCyElementsByIds(this.rootElementIds, this.cy),
			dependencies = getNeighbors(rootElements),
			goalSelectionElements = [...rootElements, ...dependencies],
			selectedElements = this.cy.$(":selected").nodes(),
			selectedDependencies = selectedElements.filter((element) => {
				return goalSelectionElements.some((dependency) => {
					return element.id() === dependency.id();
				});
			});

		return [
			selectedDependencies.size(),
			goalSelectionElements.length,
			selectedElements.size() - selectedDependencies.size(),
		];
	}
}
