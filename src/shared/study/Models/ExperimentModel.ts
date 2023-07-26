import { TASKS } from "./TASKS";
import { TaskModel } from "./TaskModel";

type TaskId = string;

export enum ConditionType {
	CONTROL = "control",
	EXPERIMENT = "experiment",
}

export interface ConditionInfo {
	type: ConditionType;
	index: number;
}

export interface ConditionModel {
	type: ConditionType;
	tasks: TaskId[];
}
export interface ExperimentModel {
	participantId: string;
	conditions: ConditionModel[];
}

export const EXAMPLE_EXPERIMENT: ExperimentModel = {
	participantId: "example",
	conditions: [
		{
			type: ConditionType.EXPERIMENT,
			tasks: ["all-0-t"],
		},
		{
			type: ConditionType.CONTROL,
			tasks: ["all-0-t"],
		},
		{
			type: ConditionType.EXPERIMENT,
			tasks: ["all-0-t", "all-0-t"],
		},
		{
			type: ConditionType.EXPERIMENT,
			tasks: ["all-0-t"],
		},
	],
};

export const getTaskId = (
	conditionIndex: number,
	taskIndex: number,
	experiment: ExperimentModel
): string | undefined => experiment.conditions[conditionIndex].tasks[taskIndex];

export const getTaskById = (id: TaskId): TaskModel => {
	const task = TASKS.find((task) => task.id === id);
	if (!task) throw new Error(`Task with id ${id} not found`);
	return task;
};
