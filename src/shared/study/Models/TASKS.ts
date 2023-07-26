import {
	TaskModel,
	TaskType,
	SelectAllTaskModel,
	SelectDependenciesTaskModel,
	SelectPathTaskModel,
	SelectWithPropertyTaskModel,
	SelectExceptTaskModel,
	SelectAnyNTaskModel,
	WatchVideoTaskModel,
} from "./TaskModel";

const VOXELS = "entity/Q152",
	POINTS_AND_VECTORS = "entity/Q106",
	RAY_TRACING = "entity/Q116",
	TRANSFORMATION_MATRICES = "entity/Q140",
	RENDERING_A_COMPLEX_SCENE = "entity/Q119";

const VIDEO_TASKS: TaskModel[] = [
	{
		id: "video-e",
		type: TaskType.WATCH_VIDEO,
		length: 287,
		link: "https://www.youtube.com/watch?v=nPm8Hx8Vyf4",
	} as WatchVideoTaskModel,
	{
		id: "video-c",
		type: TaskType.WATCH_VIDEO,
		length: 210,
		link: "https://www.youtube.com/watch?v=XIGy6RUGNrk",
	} as WatchVideoTaskModel,
];

const TUTORIAL_TASKS: TaskModel[] = [
	{
		id: "all-0-t",
		type: TaskType.SELECT_ALL_TUTORIAL,
	} as SelectAllTaskModel,
	{
		id: "property-0-t",
		type: TaskType.SELECT_WITH_PROPERTY_TUTORIAL,
		property: "label",
		values: ["Clipping"],
	} as SelectWithPropertyTaskModel,
	{
		id: "property-1-t",
		type: TaskType.SELECT_WITH_PROPERTY_TUTORIAL,
		property: "class",
		values: ["Markers"],
	} as SelectWithPropertyTaskModel,
	{
		id: "dependencies-0-t",
		type: TaskType.SELECT_DEPENDENCIES_TUTORIAL,
		rootElementIds: [TRANSFORMATION_MATRICES],
	} as SelectDependenciesTaskModel,
	{
		id: "path-0-t",
		type: TaskType.SELECT_PATH_TUTORIAL,
		fromElementId: "entity/Q34",
		toElementId: "entity/Q128",
	} as SelectPathTaskModel,
	{
		id: "except-all-property-0-t",
		type: TaskType.SELECT_EXCEPT_TUTORIAL,
		select: {
			id: "all-0-t",
			type: TaskType.SELECT_ALL,
		},
		except: {
			id: "property-0-t",
			type: TaskType.SELECT_WITH_PROPERTY,
			property: "label",
			values: ["Polygons"],
		},
	} as SelectExceptTaskModel,
	{
		id: "anyn-0-t",
		type: TaskType.SELECT_ANY_N_TUTORIAL,
		n: 6,
	} as SelectAnyNTaskModel,
];

// TASKS
export const TASKS: TaskModel[] = [
	...VIDEO_TASKS,
	...TUTORIAL_TASKS,
	// ALL
	{
		id: "all-0",
		type: TaskType.SELECT_ALL,
	} as SelectAllTaskModel,
	// DEPENDENCIES
	{
		id: "dependencies-0",
		type: TaskType.SELECT_DEPENDENCIES,
		rootElementIds: [TRANSFORMATION_MATRICES],
	} as SelectDependenciesTaskModel,
	{
		id: "dependencies-1",
		type: TaskType.SELECT_DEPENDENCIES,
		rootElementIds: [POINTS_AND_VECTORS],
	} as SelectDependenciesTaskModel,
	// PATH
	{
		id: "path-0",
		type: TaskType.SELECT_PATH,
		fromElementId: VOXELS,
		toElementId: POINTS_AND_VECTORS,
	} as SelectPathTaskModel,
	{
		id: "path-1",
		type: TaskType.SELECT_PATH,
		fromElementId: RENDERING_A_COMPLEX_SCENE,
		toElementId: RAY_TRACING,
	} as SelectPathTaskModel,
	// PROPERTIES
	// Label
	{
		id: "property-1",
		type: TaskType.SELECT_WITH_PROPERTY,
		property: "label",
		values: ["Phong Shading", "Flat Shading", "Gouraud Shading"],
	} as SelectWithPropertyTaskModel,
	{
		id: "property-11",
		type: TaskType.SELECT_WITH_PROPERTY,
		property: "class",
		values: ["3D Graphics"],
	} as SelectWithPropertyTaskModel,

	// EXCEPT
	// properties
	// class
	{
		id: "except-all-property-0",
		type: TaskType.SELECT_EXCEPT,
		select: {
			id: "all-0",
			type: TaskType.SELECT_ALL,
		} as SelectAllTaskModel,
		except: {
			id: "property-91",
			property: "class",
			values: ["Computer Vision"],
			type: TaskType.SELECT_WITH_PROPERTY,
		} as SelectWithPropertyTaskModel,
	} as SelectExceptTaskModel,
];
