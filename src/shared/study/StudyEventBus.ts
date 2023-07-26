import EventEmitter from "events";

class StudyEventBus extends EventEmitter {}

export const studyEventBus = new StudyEventBus();

export enum StudyEvent {
	SELECTION_CHANGED = "selection-changed",

	TASK_READY = "task-ready",
	TASK_FINISHED = "task-finished",
	TASK_STARTED = "task-started",

	TASK_SKIP = "task-skip",
	TASK_START = "task-start",
	TASK_FINISH = "task-finish",
	TASK_HELP = "task-help",

	CONDITION_TASKS_COMPLETED = "condition-tasks-completed",
	CONDITION_POST_QUESTIONNAIRE_COMPLETED = "condition-post-questionnaire-completed",
}
