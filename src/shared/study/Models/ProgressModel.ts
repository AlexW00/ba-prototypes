export enum StudyStage {
	PRE_EXPERIMENT = "pre-experiment",
	EXPERIMENT = "experiment",
	POST_EXPERIMENT = "post-experiment",
}

export interface ProgressModel {
	stage: StudyStage;
	currentConditionIndex: number;
	currentTaskIndex: number;
	numCompletedTasks: number;
	didSendDataToServer: boolean;
}

export const PROGRESS_INITIAL: ProgressModel = {
	stage: StudyStage.PRE_EXPERIMENT,
	currentConditionIndex: 0,
	currentTaskIndex: 0,
	numCompletedTasks: 0,
	didSendDataToServer: false,
};
