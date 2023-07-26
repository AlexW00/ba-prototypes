import {
	allShortestPaths,
	getCyElementsByIds,
	getNeighbors,
} from "../../../pages/selectionTools/ui/graph/CytoscapeElements";
import { ConditionInfo } from "../Models/ExperimentModel";
import { SelectPathTaskModel } from "../Models/TaskModel";
import { Task } from "./Task";
import cytoscape from "cytoscape-select";

export class SelectPathTask extends Task implements SelectPathTaskModel {
	fromElementId: string;
	toElementId: string;

	constructor(
		model: SelectPathTaskModel,
		conditionInfo: ConditionInfo,
		cy: cytoscape.Core,
		[relativeIndex, absoluteIndex]: [number, number]
	) {
		super(model, conditionInfo, cy, [relativeIndex, absoluteIndex]);
		this.fromElementId = model.fromElementId;
		this.toElementId = model.toElementId;
	}

	public getDescription(): string {
		const [fromElement, toElement] = getCyElementsByIds(
				[this.fromElementId, this.toElementId],
				this.cy
			),
			fromLabel = fromElement.data()?.label,
			toLabel = toElement.data()?.label;

		return `den kürzesten Pfad von "${fromLabel}" nach "${toLabel}"`;
	}

	getTitle(): string {
		return "Kürzester Pfad";
	}

	getProgress(): [number, number, number] {
		const shortestPaths = allShortestPaths(
				this.cy,
				this.fromElementId,
				this.toElementId
			),
			shortestPathLength =
				shortestPaths[0] !== undefined ? shortestPaths[0].length : 0,
			selectedNodes = this.cy.nodes(":selected"),
			numSelectedNodes = selectedNodes.size();

		let highestScore = 0;

		shortestPaths.forEach((nodeIds) => {
			const pathLength = nodeIds.length,
				numSelectedNodes = selectedNodes
					.filter((node) => nodeIds.includes(node.id()))
					.size();
			if (numSelectedNodes > highestScore) {
				highestScore = numSelectedNodes;
			}
		});

		return [highestScore, shortestPathLength, numSelectedNodes - highestScore];
	}

	getLowestProgress(): [number, number, number] {
		const shortestPaths = allShortestPaths(
				this.cy,
				this.fromElementId,
				this.toElementId
			),
			shortestPathLength =
				shortestPaths[0] !== undefined ? shortestPaths[0].length : 0,
			selectedNodes = this.cy.nodes(":selected"),
			numSelectedNodes = selectedNodes.size();

		let lowestScore = 0;

		shortestPaths.forEach((nodeIds) => {
			const pathLength = nodeIds.length,
				numSelectedNodes = selectedNodes
					.filter((node) => nodeIds.includes(node.id()))
					.size();
			if (numSelectedNodes < lowestScore) {
				lowestScore = numSelectedNodes;
			}
		});

		return [lowestScore, shortestPathLength, numSelectedNodes - lowestScore];
	}
}
