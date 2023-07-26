import { UEQAnswers } from "../ui/postConditionQuestionnaire/UEQ_QUESTIONS";
import { Api } from "./Api";
import {
	ConditionInfo,
	ConditionModel,
	EXAMPLE_EXPERIMENT,
	ExperimentModel,
	getTaskById,
	getTaskId,
} from "./Models/ExperimentModel";
import { LogsModel } from "./Models/LogsModel";
import {
	PROGRESS_INITIAL,
	ProgressModel,
	StudyStage,
} from "./Models/ProgressModel";
import { CompletedTaskModel, PostConditionModel } from "./Models/ResultsModel";
import { TaskModel } from "./Models/TaskModel";
import { LogEvent } from "./TaskLogger";

enum StorageKey {
	LOGS = "logs",
	EXPERIMENT = "experiment",
	PROGRESS = "progress",
	RESULTS = "results",
}

export default class StorageManager {
	async init() {
		// if (!this.hasItem(StorageKey.LOGS))
		// 	this.setItem(StorageKey.LOGS, `${LogEvent.csvHeader()}\n`);
		// if (!this.hasItem(StorageKey.EXPERIMENT)) {
		// 	const experimentModel = await Api.getExperimentModel();
		// 	this.setExperimentModel(experimentModel);
		// }
		// if (!this.hasItem(StorageKey.PROGRESS)) this.setProgress(PROGRESS_INITIAL);
	}

	addResult(result: CompletedTaskModel | PostConditionModel) {
		const results = this.getResultsString();
		this.setItem(StorageKey.RESULTS, `${results}\n${JSON.stringify(result)}`);
	}

	getResultsString(): string {
		const resultsString = this.getItem(StorageKey.RESULTS, false);
		return resultsString === null ? "" : resultsString;
	}

	getProgress(): ProgressModel {
		return this.getItem(StorageKey.PROGRESS, true);
	}

	getNumberOfConditions(): number {
		return this.getExperimentModel().conditions.length;
	}

	getTotalNumberOfTasks(): number {
		return this.getExperimentModel().conditions.reduce(
			(sum, condition) => sum + condition.tasks.length,
			0
		);
	}

	public stepNextCondition(): ConditionModel | null {
		const progress = this.getProgress(),
			experimentModel = this.getExperimentModel();

		const taskIndex = 0;
		this.setProgressTaskIndex(taskIndex);

		const nextConditionIndex = progress.currentConditionIndex + 1;
		this.setProgressConditionIndex(nextConditionIndex);

		const nextCondition = experimentModel.conditions[nextConditionIndex];
		if (nextCondition !== undefined) {
			return nextCondition;
		} else {
			// experiment end reached
			return null;
		}
	}

	public setDidSendDataToServer(didSend: boolean) {
		const progress = this.getProgress();
		progress.didSendDataToServer = didSend;
		this.setProgress(progress);
	}

	public getCurrentCondition(): ConditionModel | undefined {
		const progress = this.getProgress(),
			experimentModel = this.getExperimentModel();
		return experimentModel.conditions[progress.currentConditionIndex];
	}

	public tryStepNextTask(): TaskModel | null {
		const progress = this.getProgress();

		const conditionIndex = progress.currentConditionIndex,
			taskIndex = progress.currentTaskIndex;

		const nextTaskIndex = taskIndex + 1;
		this.setProgressTaskIndex(taskIndex + 1);
		this.incrementProgressNumTasksCompleted();

		const nextTaskModel = this.getTaskModel(conditionIndex, nextTaskIndex);
		if (nextTaskModel !== null) {
			return nextTaskModel;
		} else {
			// condition end reached
			return null;
		}
	}

	hasFinishedTasksOfCurrentCondition(): boolean {
		const progress = this.getProgress(),
			experimentModel = this.getExperimentModel();

		const conditionIndex = progress.currentConditionIndex,
			taskIndex = progress.currentTaskIndex;

		const condition = experimentModel.conditions[conditionIndex];
		return taskIndex >= condition.tasks.length;
	}

	getParticipantId() {
		const experimentModel = this.getExperimentModel();
		return experimentModel.participantId;
	}

	setExperimentModel(experimentModel: ExperimentModel) {
		this.setItem(StorageKey.EXPERIMENT, experimentModel);
	}

	getExperimentModel(): ExperimentModel {
		return this.getItem(StorageKey.EXPERIMENT, true);
	}

	getCurrentTaskModel(): TaskModel | null {
		const progress = this.getProgress(),
			experimentModel = this.getExperimentModel();

		const conditionIndex = progress.currentConditionIndex,
			taskIndex = progress.currentTaskIndex;

		return this.getTaskModel(conditionIndex, taskIndex);
	}

	getTaskModel(conditionIndex: number, taskIndex: number): TaskModel | null {
		const experimentModel = this.getExperimentModel(),
			taskId = getTaskId(conditionIndex, taskIndex, experimentModel);
		if (taskId !== undefined) return getTaskById(taskId);
		else return null;
	}
	getProgressStudyStage(): StudyStage {
		const progress = this.getProgress();
		return progress.stage;
	}
	getProgressConditionInfo(): ConditionInfo | null {
		const progress = this.getProgress(),
			experimentModel = this.getExperimentModel();

		const conditionIndex = progress.currentConditionIndex;
		const condition = experimentModel.conditions[conditionIndex];
		if (condition === undefined) return null;
		return {
			index: conditionIndex,
			type: condition.type,
		};
	}

	setProgressTaskIndex(index: number) {
		const progress = this.getProgress();
		progress.currentTaskIndex = index;
		this.setProgress(progress);
	}

	incrementProgressNumTasksCompleted() {
		const progress = this.getProgress();
		progress.numCompletedTasks++;
		this.setProgress(progress);
	}

	setProgressConditionIndex(index: number) {
		const progress = this.getProgress();
		progress.currentConditionIndex = index;
		this.setProgress(progress);
	}

	setProgressStage(stage: StudyStage) {
		const progress = this.getProgress();
		progress.stage = stage;
		this.setProgress(progress);
	}

	setProgress(progress: ProgressModel) {
		this.setItem(StorageKey.PROGRESS, progress);
	}

	addLog(log: LogEvent) {
		const csvLine = log.toCsvLine(),
			csvLogs = this.getLogs();

		const newCsvLogs = `${csvLogs}\n${csvLine}`;

		this.setItem(StorageKey.LOGS, newCsvLogs);
	}

	getLogs(): LogsModel {
		return this.getItem(StorageKey.LOGS) ?? "";
	}

	private setItem(key: StorageKey, value: any) {
		const doStringify = typeof value === "object",
			raw = doStringify ? JSON.stringify(value) : value;
		localStorage.setItem(key, raw);
	}

	private getItem(key: StorageKey, doParse = false) {
		const raw = localStorage.getItem(key);
		if (raw === null) return null;
		return doParse ? JSON.parse(raw) : raw;
	}

	private hasItem(key: StorageKey) {
		return localStorage.getItem(key) !== null;
	}
}
