import { Action } from "../../extensions/undo/actions/Action";
import { CompositeAction } from "../../extensions/undo/actions/CompositeAction";
import { SelectionAction } from "../../extensions/undo/actions/SelectionAction";
import { TaskType, TaskModel } from "../Models/TaskModel";
import { studyEventBus, StudyEvent } from "../StudyEventBus";
import cytoscape from "cytoscape-select";
import {
	LogEvent,
	TaskLoggerEventType,
	taskLoggerEventBus,
} from "../TaskLogger";
import { CompletedTaskModel } from "../Models/ResultsModel";
import { ConditionInfo, ConditionType } from "../Models/ExperimentModel";

export enum TaskState {
	READY = "READY",
	STARTED = "STARTED",
	COMPLETED = "COMPLETED",
	SKIPPED = "SKIPPED",
}

export abstract class Task implements TaskModel {
	protected readonly conditionType: ConditionType;
	protected readonly conditionIndex: number;

	id: string;
	type: TaskType;
	state: TaskState = TaskState.READY;

	protected readonly cy: cytoscape.Core;
	private readonly logs: LogEvent[] = [];
	private readonly actions: LogEvent[] = [];

	private startTimestamp: number = 0;
	private endTimestamp: number = 0;

	private readonly relativeIndex: number;
	private readonly absoluteIndex: number;

	constructor(
		task: TaskModel,
		conditionInfo: ConditionInfo,
		cy: cytoscape.Core,
		[relativeIndex, absoluteIndex]: [number, number]
	) {
		this.id = task.id;
		this.type = task.type;
		this.cy = cy;

		this.conditionType = conditionInfo.type;
		this.conditionIndex = conditionInfo.index;

		this.relativeIndex = relativeIndex;
		this.absoluteIndex = absoluteIndex;
	}

	public abstract getTitle(): string;
	public abstract getDescription(): string;
	public abstract getProgress(): [number, number, number];
	public hasSatisfiedAdditionalRequirements(): true | string {
		return true;
	}

	protected onAction(
		action: SelectionAction<any> | CompositeAction<SelectionAction<any>>
	): void {}

	protected onComplete(didSkip = false): void {
		studyEventBus.removeListener(
			StudyEvent.SELECTION_CHANGED,
			this.onSelectionChanged
		);
		taskLoggerEventBus.removeListener(TaskLoggerEventType.LOG, this.addLog);
		this.endTimestamp = Date.now();
		this.state = didSkip ? TaskState.SKIPPED : TaskState.COMPLETED;
		studyEventBus.emit(StudyEvent.TASK_FINISHED, this);
	}

	public complete = () => {
		console.log("completing", this.relativeIndex, this.absoluteIndex);
		this.onComplete(false);
	};
	public skip = () => {
		this.onComplete(true);
	};

	protected onStart(): void {
		studyEventBus.on(StudyEvent.SELECTION_CHANGED, this.onSelectionChanged);
		taskLoggerEventBus.on(TaskLoggerEventType.LOG, this.addLog);
		this.startTimestamp = Date.now();
		this.state = TaskState.STARTED;
		studyEventBus.emit(StudyEvent.TASK_STARTED, this.id);
	}

	public start(): void {
		this.onStart();
	}

	private onSelectionChanged = (
		action: SelectionAction<any> | CompositeAction<SelectionAction<any>>
	) => {
		console.log("Selection changed in task");
		this.addAction(action);
		this.onAction(action);
	};

	public getCompletionTime(): number {
		return this.endTimestamp - this.startTimestamp;
	}

	addLog = (log: LogEvent) => {
		this.logs.push(log);
	};

	private addAction(
		action: SelectionAction<any> | CompositeAction<SelectionAction<any>>
	): void {
		this.actions.push(action.toLog());
	}

	public getCompletedTaskModel(): CompletedTaskModel | null {
		if (this.state !== TaskState.COMPLETED && this.state !== TaskState.SKIPPED)
			return null;
		const data = {
			relativeIndex: this.relativeIndex,
			absoluteIndex: this.absoluteIndex,

			conditionType: this.conditionType,
			conditionIndex: this.conditionIndex,

			taskId: this.id,
			taskType: this.type,
			taskState: this.state,

			startTimestamp: this.startTimestamp,
			endTimestamp: this.endTimestamp,
			completionTime: this.getCompletionTime(),
			logs: this.logs,
			actions: this.actions,
		};
		return data;
	}
}
