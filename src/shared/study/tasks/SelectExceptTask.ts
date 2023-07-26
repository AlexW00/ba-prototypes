import { SelectExceptTaskModel, TaskModel } from "../Models/TaskModel";
import { Task } from "./Task";
import cytoscape from "cytoscape-select";
import { fromModel } from "./TaskMap";
import { CompositeAction } from "../../extensions/undo/actions/CompositeAction";
import { SelectionAction } from "../../extensions/undo/actions/SelectionAction";
import { ConditionInfo } from "../Models/ExperimentModel";
import { SelectPathTask } from "./SelectPathTask";

export class SelectExceptTask extends Task implements SelectExceptTaskModel {
	select: TaskModel;
	except: TaskModel;

	selectTask: Task;
	exceptTask: Task;

	constructor(
		model: SelectExceptTaskModel,
		conditionInfo: ConditionInfo,
		cy: cytoscape.Core,
		[relativeIndex, absoluteIndex]: [number, number]
	) {
		super(model, conditionInfo, cy, [relativeIndex, absoluteIndex]);
		this.select = model.select;
		this.except = model.except;

		this.selectTask = fromModel(this.select, conditionInfo, cy, [
			relativeIndex,
			absoluteIndex,
		]);
		this.exceptTask = fromModel(this.except, conditionInfo, cy, [
			relativeIndex,
			absoluteIndex,
		]);
	}

	public getDescription(): string {
		const exceptDescription = this.exceptTask
			.getDescription()
			.replace("alle ", "");
		return `${this.selectTask.getDescription()} außer ${exceptDescription}`;
	}

	getTitle(): string {
		return `${this.selectTask.getTitle()} außer ${this.exceptTask.getTitle()}`;
	}

	getProgress(): [number, number, number] {
		const selectProgress = this.selectTask.getProgress(),
			exceptProgress =
				this.exceptTask instanceof SelectPathTask
					? this.exceptTask.getLowestProgress()
					: this.exceptTask.getProgress();

		return [
			selectProgress[0] - exceptProgress[0],
			selectProgress[1] - exceptProgress[1],
			exceptProgress[0] - selectProgress[2],
		];
	}
}
