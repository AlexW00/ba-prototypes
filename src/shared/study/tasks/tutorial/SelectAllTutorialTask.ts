import { CompositeAction } from "../../../extensions/undo/actions/CompositeAction";
import { SelectionAction } from "../../../extensions/undo/actions/SelectionAction";
import { SelectionTool } from "../../SelectionTool";
import { SelectAllTask } from "../SelectAllTask";

export class SelectAllTutorialTask extends SelectAllTask {
	private hasUsedSelectAllTool: boolean = false;

	public getDescription(): string {
		return (
			super.getDescription() +
			" indem Sie die Funktion 'Alles selektieren' verwenden."
		);
	}

	getTitle(): string {
		return super.getTitle() + " (Tutorial)";
	}

	public hasSatisfiedAdditionalRequirements() {
		return this.hasUsedSelectAllTool
			? true
			: "'Alles selektieren' Werkzeug wurde nicht verwendet.";
	}

	protected onAction(
		action: SelectionAction<any> | CompositeAction<SelectionAction<any>>
	): void {
		const selectionActions: Array<SelectionAction<any>> =
			action instanceof CompositeAction ? action.getActions() : [action];

		const lastActionIsSelectAllTool =
			selectionActions[selectionActions.length - 1].tool === SelectionTool.ALL;

		if (lastActionIsSelectAllTool) this.hasUsedSelectAllTool = true;
		else this.hasUsedSelectAllTool = false;
	}
}
