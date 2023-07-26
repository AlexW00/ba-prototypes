import { CompositeAction } from "../../../extensions/undo/actions/CompositeAction";
import { SelectionAction } from "../../../extensions/undo/actions/SelectionAction";
import { SelectionTool } from "../../SelectionTool";
import { SelectAllTask } from "../SelectAllTask";
import { SelectDependenciesTask } from "../SelectDependenciesTask";
import { SelectPathTask } from "../SelectPathTask";
import { SelectWithPropertyTask } from "../SelectWithPropertyTask";

export class SelectWithPropertyTutorialTask extends SelectWithPropertyTask {
	private hasUsedCorrectTool: boolean = false;

	public getDescription(): string {
		return (
			super.getDescription() + " indem Sie die Funktion 'Suche' verwenden."
		);
	}

	getTitle(): string {
		return super.getTitle() + " (Tutorial)";
	}

	public hasSatisfiedAdditionalRequirements() {
		return this.hasUsedCorrectTool
			? true
			: "'Suche' Werkzeug wurde nicht verwendet.";
	}

	protected onAction(
		action: SelectionAction<any> | CompositeAction<SelectionAction<any>>
	): void {
		const selectionActions: Array<SelectionAction<any>> =
			action instanceof CompositeAction ? action.getActions() : [action];

		const lastTool = selectionActions[selectionActions.length - 1].tool,
			lastActionIsSelectAllTool =
				lastTool === SelectionTool.SEARCH || lastTool === SelectionTool.ALL;

		if (lastActionIsSelectAllTool) this.hasUsedCorrectTool = true;
		else this.hasUsedCorrectTool = false;
	}
}
