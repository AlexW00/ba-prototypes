import { CompositeAction } from "../../../extensions/undo/actions/CompositeAction";
import { SelectionAction } from "../../../extensions/undo/actions/SelectionAction";
import { SelectionTool } from "../../SelectionTool";
import { SelectAllTask } from "../SelectAllTask";
import { SelectDependenciesTask } from "../SelectDependenciesTask";

export class SelectDependenciesTutorialTask extends SelectDependenciesTask {
	private hasUsedCorrectTool: boolean = false;

	public getDescription(): string {
		return (
			super.getDescription() +
			" indem Sie die Funktion 'Nachbarn selektieren' verwenden."
		);
	}

	getTitle(): string {
		return super.getTitle() + " (Tutorial)";
	}

	public hasSatisfiedAdditionalRequirements() {
		return this.hasUsedCorrectTool
			? true
			: "'Nachbarn selektieren' Werkzeug wurde nicht verwendet.";
	}

	protected onAction(
		action: SelectionAction<any> | CompositeAction<SelectionAction<any>>
	): void {
		const selectionActions: Array<SelectionAction<any>> =
			action instanceof CompositeAction ? action.getActions() : [action];

		const lastActionIsSelectAllTool =
			selectionActions[selectionActions.length - 1].tool ===
			SelectionTool.NEIGHBORS;

		if (lastActionIsSelectAllTool) this.hasUsedCorrectTool = true;
		else this.hasUsedCorrectTool = false;
	}
}
