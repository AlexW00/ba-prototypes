import { CompositeAction } from "../../../extensions/undo/actions/CompositeAction";
import { SelectionAction } from "../../../extensions/undo/actions/SelectionAction";
import { SelectionTool } from "../../SelectionTool";
import { SelectAllTask } from "../SelectAllTask";
import { SelectAnyNTask } from "../SelectAnyNTask";

export class SelectRectangleLassoTutorialTask extends SelectAnyNTask {
	private hasUsedSelectAllTool: boolean = false;

	public getDescription(): string {
		return (
			super.getDescription() +
			" indem Sie die 'Rechteck/Lasso-Selektion' verwenden."
		);
	}

	getTitle(): string {
		return super.getTitle() + " (Tutorial)";
	}

	public hasSatisfiedAdditionalRequirements() {
		return this.hasUsedSelectAllTool
			? true
			: "'Rechteck/Lasso' Selektion wurde nicht verwendet.";
	}

	protected onAction(
		action: SelectionAction<any> | CompositeAction<SelectionAction<any>>
	): void {
		const selectionActions: Array<SelectionAction<any>> =
			action instanceof CompositeAction ? action.getActions() : [action];

		const lastActionIsSelectAllTool =
			selectionActions[selectionActions.length - 1].tool ===
				SelectionTool.LASSO_RECT ||
			selectionActions[selectionActions.length - 1].tool ===
				SelectionTool.RECT_ONLY;

		if (lastActionIsSelectAllTool) this.hasUsedSelectAllTool = true;
		else this.hasUsedSelectAllTool = false;
	}
}
