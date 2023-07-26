import { Core, ElementDefinition } from "cytoscape";
import { Action } from "./Action";
import {
	SelectionActionDataMap,
	SelectionTool,
} from "../../../study/SelectionTool";
import { SelectionAction } from "./SelectionAction";
import { SelectionType } from "../../../study/SelectionType";
import { getCyElementsByIds } from "../../../../pages/selectionTools/ui/graph/CytoscapeElements";

export class RemoveSelectionAction<
	T extends SelectionTool
> extends SelectionAction<T> {
	constructor(
		cy: Core,
		tool: T,
		type: SelectionType,
		data: SelectionActionDataMap[T]
	) {
		super(cy, tool, type, data);
	}

	onDo(): void {
		const elements = getCyElementsByIds(this.data.elementIds, this.cy);
		elements.forEach((el) => el.unselect());
	}

	onUndo(): void {
		const elements = getCyElementsByIds(this.data.elementIds, this.cy);
		elements.forEach((el) => el.select());
	}
	getName(): string {
		return `RemoveSelectionAction`;
	}
}
