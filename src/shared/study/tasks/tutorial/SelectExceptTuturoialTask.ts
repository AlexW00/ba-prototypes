import { CompositeAction } from "../../../extensions/undo/actions/CompositeAction";
import { SelectionAction } from "../../../extensions/undo/actions/SelectionAction";
import { SelectionTool } from "../../SelectionTool";
import { SelectAllTask } from "../SelectAllTask";
import { SelectExceptTask } from "../SelectExceptTask";

export class SelectExceptTutorialTask extends SelectExceptTask {
	private hasUsedCorrectTool: boolean = false;

	public getDescription(): string {
		return (
			super.getDescription() +
			" indem Sie die Funktion 'Selektion invertieren' verwenden."
		);
	}

	getTitle(): string {
		return super.getTitle() + " (Tutorial)";
	}

	public hasSatisfiedAdditionalRequirements() {
		return this.hasUsedCorrectTool
			? true
			: "'Selektion invertieren' Werkzeug wurde nicht verwendet.";
	}

	protected onAction(
		action: SelectionAction<any> | CompositeAction<SelectionAction<any>>
	): void {
		const selectionActions: Array<SelectionAction<any>> =
			action instanceof CompositeAction ? action.getActions() : [action];

		const lastActionIsSelectAllTool =
			selectionActions[selectionActions.length - 1].tool ===
			SelectionTool.INVERT;

		if (lastActionIsSelectAllTool) this.hasUsedCorrectTool = true;
		else this.hasUsedCorrectTool = false;
	}
}
