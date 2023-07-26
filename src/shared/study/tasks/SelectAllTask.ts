import { Task } from "./Task";
import { SelectAllTaskModel } from "../Models/TaskModel";
import cytoscape from "cytoscape-select";
import { ConditionInfo } from "../Models/ExperimentModel";

export class SelectAllTask extends Task implements SelectAllTaskModel {
	constructor(
		model: SelectAllTaskModel,
		conditionInfo: ConditionInfo,
		cy: cytoscape.Core,
		[relativeIndex, absoluteIndex]: [number, number]
	) {
		super(model, conditionInfo, cy, [relativeIndex, absoluteIndex]);
	}

	public getDescription(): string {
		return `alle Knoten`;
	}

	getTitle(): string {
		return "Alle Knoten";
	}

	getProgress(): [number, number, number] {
		const allNodes = this.cy.nodes(),
			numAllNodes = allNodes.size(),
			selectedNodes = this.cy.nodes(":selected"),
			numSelectedNodes = selectedNodes.size();
		// console.log(numSelectedNodes, numAllNodes);

		return [numSelectedNodes, numAllNodes, 0];
	}
}
