import { Core, ElementDefinition } from "cytoscape";
import { SelectionAction, SelectionActionData } from "./SelectionAction";
import {
	SelectionActionDataMap,
	SelectionTool,
} from "../../../study/SelectionTool";
import { SelectionType } from "../../../study/SelectionType";
import { getCyElementsByIds } from "../../../../pages/selectionTools/ui/graph/CytoscapeElements";

export class AddSelectionAction<
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
		elements.forEach((el) => el.select());
	}
	onUndo(): void {
		const elements = getCyElementsByIds(this.data.elementIds, this.cy);
		elements.forEach((el) => el.unselect());
	}

	getName(): string {
		return "AddSelectionAction";
	}
}
