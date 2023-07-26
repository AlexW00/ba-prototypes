import { TaskModel, TaskType } from "../Models/TaskModel";

import cytoscape from "cytoscape-select";
import { SelectAllTask } from "./SelectAllTask";
import { SelectDependenciesTask } from "./SelectDependenciesTask";
import { SelectExceptTask } from "./SelectExceptTask";
import { SelectPathTask } from "./SelectPathTask";
import { SelectWithPropertyTask } from "./SelectWithPropertyTask";
import { Task } from "./Task";
import { ConditionInfo } from "../Models/ExperimentModel";
import { SelectDependenciesTutorialTask } from "./tutorial/SelectDependenciesTutorialTask";
import { SelectPathTutorialTask } from "./tutorial/SelectPathTutorialTask";
import { SelectWithPropertyTutorialTask } from "./tutorial/SelectWithPropertyTutorialTask";
import { SelectExceptTutorialTask } from "./tutorial/SelectExceptTuturoialTask";
import { SelectAllTutorialTask } from "./tutorial/SelectAllTutorialTask";
import { SelectRectangleLassoTutorialTask } from "./tutorial/SelectRectangleLassoTutorialTask";
import { WatchVideoTask } from "./tutorial/WatchVideoTask";
import { SelectAnyNTask } from "./SelectAnyNTask";

export interface TaskMap {
	[TaskType.SELECT_DEPENDENCIES]: SelectDependenciesTask;
	[TaskType.SELECT_PATH]: SelectPathTask;
	[TaskType.SELECT_WITH_PROPERTY]: SelectWithPropertyTask;
	[TaskType.SELECT_EXCEPT]: SelectExceptTask;
	[TaskType.SELECT_ALL]: SelectAllTask;
	[TaskType.SELECT_ANY_N]: SelectRectangleLassoTutorialTask;

	// tutorial tasks
	[TaskType.SELECT_ALL_TUTORIAL]: SelectAllTutorialTask;
	[TaskType.SELECT_DEPENDENCIES_TUTORIAL]: SelectDependenciesTutorialTask;
	[TaskType.SELECT_PATH_TUTORIAL]: SelectPathTutorialTask;
	[TaskType.SELECT_WITH_PROPERTY_TUTORIAL]: SelectWithPropertyTutorialTask;
	[TaskType.SELECT_EXCEPT_TUTORIAL]: SelectExceptTutorialTask;
	[TaskType.SELECT_ANY_N_TUTORIAL]: SelectRectangleLassoTutorialTask;
	[TaskType.WATCH_VIDEO]: SelectRectangleLassoTutorialTask;
}

const getConstructor = (type: TaskType): any => {
	switch (type) {
		case TaskType.SELECT_DEPENDENCIES:
			return SelectDependenciesTask;
		case TaskType.SELECT_PATH:
			return SelectPathTask;
		case TaskType.SELECT_WITH_PROPERTY:
			return SelectWithPropertyTask;
		case TaskType.SELECT_EXCEPT:
			return SelectExceptTask;
		case TaskType.SELECT_ALL:
			return SelectAllTask;
		case TaskType.SELECT_ANY_N:
			return SelectAnyNTask;
		case TaskType.SELECT_ALL_TUTORIAL:
			return SelectAllTutorialTask;
		case TaskType.SELECT_DEPENDENCIES_TUTORIAL:
			return SelectDependenciesTutorialTask;
		case TaskType.SELECT_PATH_TUTORIAL:
			return SelectPathTutorialTask;
		case TaskType.SELECT_WITH_PROPERTY_TUTORIAL:
			return SelectWithPropertyTutorialTask;
		case TaskType.SELECT_EXCEPT_TUTORIAL:
			return SelectExceptTutorialTask;
		case TaskType.SELECT_ANY_N_TUTORIAL:
			return SelectRectangleLassoTutorialTask;
		case TaskType.WATCH_VIDEO:
			return WatchVideoTask;

		default:
			throw new Error(`Task type ${type} not implemented`);
	}
};

export const fromModel = (
	model: TaskModel,
	conditionInfo: ConditionInfo,
	cy: cytoscape.Core,
	[relativeIndex, absoluteIndex]: [number, number]
): Task => {
	const Constructor = getConstructor(model.type);
	return new Constructor(model, conditionInfo, cy, [
		relativeIndex,
		absoluteIndex,
	]);
};
