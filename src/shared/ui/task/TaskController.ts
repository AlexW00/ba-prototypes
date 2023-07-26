import {
	SelectDependenciesTaskModel,
	TaskModel,
	TaskType,
} from "../../study/Models/TaskModel";
import { StudyEvent, studyEventBus } from "../../study/StudyEventBus";
import StorageManager from "../../study/StorageManager";
import cytoscape from "cytoscape-select";
import { TaskView } from "./TaskView";
import { Task } from "../../study/tasks/Task";
import { fromModel } from "../../study/tasks/TaskMap";
import { ConditionInfo } from "../../study/Models/ExperimentModel";
import { TaskLogger, ApplicationAction } from "../../study/TaskLogger";
export default class TaskController {
	private readonly taskView: TaskView;

	private readonly storageManager: StorageManager;
	private readonly cy: cytoscape.Core;

	private activeTask: Task | null = null;

	constructor(storageManager: StorageManager, cy: cytoscape.Core) {
		this.storageManager = storageManager;
		this.cy = cy;
		this.taskView = new TaskView();

		studyEventBus.on(StudyEvent.TASK_START, this.onStartTask);
		studyEventBus.on(StudyEvent.TASK_SKIP, this.onSkipTask);
		studyEventBus.on(StudyEvent.TASK_FINISH, this.onFinishTask);

		studyEventBus.on(StudyEvent.TASK_STARTED, this.onTaskStarted);
		studyEventBus.on(StudyEvent.TASK_FINISHED, this.onTaskFinished);
	}

	private onStartTask = () => {
		if (this.activeTask === null) throw new Error("No active task");
		TaskLogger.logAction(ApplicationAction.DO_TASK, {
			action: "start",
		});
		this.activeTask.start();
	};
	private onSkipTask = () => {
		if (this.activeTask === null) throw new Error("No active task");
		TaskLogger.logAction(ApplicationAction.DO_TASK, {
			action: "skip",
		});
		this.activeTask.skip();
	};

	private onFinishTask = () => {
		if (this.activeTask === null) throw new Error("No active task");
		TaskLogger.logAction(ApplicationAction.DO_TASK, {
			action: "finish",
		});

		// save result of task
		const result = this.activeTask.getCompletedTaskModel();
		if (result === null) {
			console.warn("Cant log task!!!!");
			return;
		}
		this.storageManager.addResult(result);

		const nextTaskModel = this.storageManager.tryStepNextTask();
		if (nextTaskModel === null) {
			this.toggleVisibility(false);
			studyEventBus.emit(StudyEvent.CONDITION_TASKS_COMPLETED);
		} else this.onTaskReady(nextTaskModel);
	};

	private onTaskReady = (nextTaskModel: TaskModel) => {
		studyEventBus.emit(StudyEvent.TASK_READY);
		const progress = this.storageManager.getProgress(),
			conditionInfo = this.storageManager.getProgressConditionInfo();
		if (conditionInfo === null) throw new Error("No condition info");

		const taskIndex = progress.currentTaskIndex,
			absoluteTaskIndex = progress.numCompletedTasks;

		this.activeTask = fromModel(nextTaskModel, conditionInfo, this.cy, [
			taskIndex,
			absoluteTaskIndex,
		]);
		this.updateView();
	};

	private onTaskStarted = () => {
		if (this.activeTask === null) throw new Error("No active task");
		studyEventBus.on(StudyEvent.SELECTION_CHANGED, this.onSelectionChanged);
		this.taskView.updateState(this.activeTask.state);
	};

	private onTaskFinished = () => {
		studyEventBus.removeListener(
			StudyEvent.SELECTION_CHANGED,
			this.onSelectionChanged
		);
		if (this.activeTask === null) throw new Error("No active task");
		this.taskView.updateState(this.activeTask.state);
		this.taskView.updateProgress(
			...this.activeTask.getProgress(),
			this.activeTask.hasSatisfiedAdditionalRequirements()
		);
	};

	private onSelectionChanged = () => {
		if (this.activeTask === null) throw new Error("No active task");
		const [current, total, other] = this.activeTask.getProgress(),
			hasSatisfiedAdditionalRequirements =
				this.activeTask.hasSatisfiedAdditionalRequirements();

		this.taskView.updateProgress(
			current,
			total,
			other,
			hasSatisfiedAdditionalRequirements
		);
		if (
			current === total &&
			other === 0 &&
			hasSatisfiedAdditionalRequirements === true
		)
			this.activeTask.complete();
	};

	public loadCurrentTask(): boolean {
		const currentTaskModel = this.storageManager.getCurrentTaskModel();
		if (currentTaskModel === null) {
			console.log("No current task");
			this.taskView.toggleVisibility(false);
			return false;
		} else {
			this.taskView.toggleVisibility(true);
			this.onTaskReady(currentTaskModel);
			return true;
		}
	}

	public toggleVisibility(on: boolean): void {
		this.taskView.toggleVisibility(on);
	}

	private updateView(): void {
		const progress = this.storageManager.getProgress();

		const taskIndex = progress.currentTaskIndex,
			conditionIndex = progress.currentConditionIndex + 1,
			tasksPerCondition = this.storageManager.getTotalNumberOfTasks() / 2;
		if (this.activeTask === null) throw new Error("No active task");
		this.taskView.updateTitle(this.activeTask.getTitle());
		this.taskView.updateStudyProgress(
			taskIndex,
			tasksPerCondition,
			conditionIndex
		);
		this.taskView.updateDescription(this.activeTask.getDescription());
		this.taskView.updateProgress(
			...this.activeTask.getProgress(),
			this.activeTask.hasSatisfiedAdditionalRequirements()
		);

		this.taskView.updateState(this.activeTask.state);
	}
}
