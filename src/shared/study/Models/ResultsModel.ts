import { UEQAnswers } from "../../ui/postConditionQuestionnaire/UEQ_QUESTIONS";
import { LogEvent } from "../TaskLogger";
import { TaskState } from "../tasks/Task";
import { ConditionType } from "./ExperimentModel";

export interface CompletedTaskModel {
	relativeIndex: number;
	absoluteIndex: number;

	conditionType: ConditionType;
	conditionIndex: number;

	taskId: string;
	taskType: string;
	taskState: TaskState.COMPLETED | TaskState.SKIPPED;

	startTimestamp: number;
	endTimestamp: number;
	completionTime: number;
	logs: LogEvent[];
	actions: LogEvent[];
}

export interface PostConditionModel {
	ueqAnswers: UEQAnswers;
	conditionType: ConditionType;
	conditionIndex: number;
}
