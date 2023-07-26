export enum TaskType {
	SELECT_DEPENDENCIES = "SELECT_DEPENDENCIES",
	SELECT_PATH = "SELECT_PATH",
	SELECT_WITH_PROPERTY = "SELECT_WITH_PROPERTY",
	SELECT_EXCEPT = "SELECT_EXCEPT",
	SELECT_ALL = "SELECT_ALL",
	SELECT_ANY_N = "SELECT_ANY_N",

	// tutorial tasks
	SELECT_ALL_TUTORIAL = "SELECT_ALL_TUTORIAL",
	SELECT_DEPENDENCIES_TUTORIAL = "SELECT_DEPENDENCIES_TUTORIAL",
	SELECT_PATH_TUTORIAL = "SELECT_PATH_TUTORIAL",
	SELECT_WITH_PROPERTY_TUTORIAL = "SELECT_WITH_PROPERTY_TUTORIAL",
	SELECT_EXCEPT_TUTORIAL = "SELECT_EXCEPT_TUTORIAL",
	SELECT_ANY_N_TUTORIAL = "SELECT_ANY_N_TUTORIAL",
	WATCH_VIDEO = "WATCH_VIDEO",
}

export interface TaskModel {
	id: string;
	type: TaskType;
}

export interface TaskModelMap {
	[TaskType.SELECT_DEPENDENCIES]: SelectDependenciesTaskModel;
	[TaskType.SELECT_PATH]: SelectPathTaskModel;
	[TaskType.SELECT_WITH_PROPERTY]: SelectWithPropertyTaskModel;
	[TaskType.SELECT_EXCEPT]: SelectExceptTaskModel;
	[TaskType.SELECT_ALL]: SelectAllTaskModel;
	[TaskType.SELECT_ANY_N]: SelectAnyNTaskModel;

	// tutorial tasks
	[TaskType.SELECT_DEPENDENCIES_TUTORIAL]: SelectDependenciesTaskModel;
	[TaskType.SELECT_PATH_TUTORIAL]: SelectPathTaskModel;
	[TaskType.SELECT_WITH_PROPERTY_TUTORIAL]: SelectWithPropertyTaskModel;
	[TaskType.SELECT_ALL_TUTORIAL]: SelectAllTaskModel;
	[TaskType.SELECT_EXCEPT_TUTORIAL]: SelectExceptTaskModel;
	[TaskType.SELECT_ANY_N_TUTORIAL]: SelectAnyNTaskModel;
	[TaskType.WATCH_VIDEO]: WatchVideoTaskModel;
}

export interface SelectDependenciesTaskModel extends TaskModel {
	rootElementIds: string[];
}

export interface SelectPathTaskModel extends TaskModel {
	fromElementId: string;
	toElementId: string;
}

export interface SelectWithPropertyTaskModel extends TaskModel {
	property: string;
	values: string[];
}

// IMPLEMENTABLE?
export interface SelectExceptTaskModel extends TaskModel {
	select: TaskModel;
	except: TaskModel;
}

export interface SelectAllTaskModel extends TaskModel {}

export interface SelectAnyNTaskModel extends TaskModel {
	n: number;
}

export interface WatchVideoTaskModel extends TaskModel {
	link: string;
	length: number;
}
