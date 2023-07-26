import { Task } from "./Task";
import { SelectAllTaskModel, SelectAnyNTaskModel } from "../Models/TaskModel";
import cytoscape from "cytoscape-select";
import { ConditionInfo } from "../Models/ExperimentModel";

export class SelectAnyNTask extends Task implements SelectAnyNTaskModel {
	n: number;

	constructor(
		model: SelectAnyNTaskModel,
		conditionInfo: ConditionInfo,
		cy: cytoscape.Core,
		[relativeIndex, absoluteIndex]: [number, number]
	) {
		super(model, conditionInfo, cy, [relativeIndex, absoluteIndex]);
		this.n = model.n;
	}

	public getDescription(): string {
		return `${this.n} beliebige Knoten`;
	}

	getTitle(): string {
		return `Beliebige Knoten`;
	}

	getProgress(): [number, number, number] {
		const allNodes = this.cy.nodes(),
			numAllNodes = allNodes.size(),
			selectedNodes = this.cy.nodes(":selected"),
			numSelectedNodes = selectedNodes.size(),
			numTooMany = Math.max(0, numSelectedNodes - this.n);

		return [numSelectedNodes, this.n, numTooMany];
	}
}
