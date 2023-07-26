import {
	SelectionActionDataMap,
	SelectionTool,
} from "../../../study/SelectionTool";
import { SelectionType } from "../../../study/SelectionType";
import { StudyEvent, studyEventBus } from "../../../study/StudyEventBus";
import { Action } from "./Action";
import cytoscape from "cytoscape";

export abstract class SelectionAction<T extends SelectionTool> extends Action {
	protected readonly cy: cytoscape.Core;
	readonly tool: T;
	readonly type: SelectionType;
	readonly data: SelectionActionDataMap[T];

	constructor(
		cy: cytoscape.Core,
		tool: T,
		type: SelectionType,
		data: SelectionActionDataMap[T]
	) {
		super();
		this.cy = cy;
		this.tool = tool;
		this.type = type;
		this.data = data;
	}

	do(isComposite: boolean): void {
		this.onDo();
		if (!isComposite) studyEventBus.emit(StudyEvent.SELECTION_CHANGED, this);
	}

	undo(isComposite: boolean): void {
		this.onUndo();
		if (!isComposite) studyEventBus.emit(StudyEvent.SELECTION_CHANGED, this);
	}

	getData(): any {
		return {
			tool: this.tool,
			type: this.type,
			data: this.data,
		};
	}

	numElements(): number {
		return this.data.elementIds.length;
	}

	abstract onDo(): void;

	abstract onUndo(): void;
}

export interface SelectionActionData {
	elementIds: string[];
}
