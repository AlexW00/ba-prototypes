import { ConditionInfo } from "../Models/ExperimentModel";
import {
	SelectPathTaskModel,
	SelectWithPropertyTaskModel,
} from "../Models/TaskModel";
import { Task } from "./Task";
import cytoscape from "cytoscape-select";

export class SelectWithPropertyTask
	extends Task
	implements SelectWithPropertyTaskModel
{
	property: string;
	values: string[];

	constructor(
		model: SelectWithPropertyTask,
		conditionInfo: ConditionInfo,
		cy: cytoscape.Core,
		[relativeIndex, absoluteIndex]: [number, number]
	) {
		super(model, conditionInfo, cy, [relativeIndex, absoluteIndex]);
		console.log("SelectWithPropertyTask", model);
		this.property = model.property;
		this.values = model.values;
	}
	private mapValuesToDescription(): string {
		return this.values.map((value) => `"${value}"`).join(" oder ");
	}

	public getDescription(): string {
		return `alle Knoten mit der Eigenschaft ${
			this.property
		}: ${this.mapValuesToDescription()}`;
	}

	getTitle(): string {
		return "Alle Knoten mit " + this.property + " auswählen";
	}

	getProgress(): [number, number, number] {
		const allNodesWithProperty = this.cy.nodes().filter((node) => {
				const property = node.data(this.property);
				if (property === undefined) return false;
				return this.values.includes(property);
			}),
			selectedNodes = this.cy.nodes(":selected"),
			correctlySelectedNodes = selectedNodes.filter((node) =>
				allNodesWithProperty.contains(node)
			);

		return [
			correctlySelectedNodes.size(),
			allNodesWithProperty.size(),
			selectedNodes.size() - correctlySelectedNodes.size(),
		];
	}
}
