import { ApplicationAction, TaskLogger } from "../../study/TaskLogger";
import { Action } from "./actions/Action";
import { CompositeAction } from "./actions/CompositeAction";

export class ActionManager {
	private readonly undoStack: Action[] = [];
	private readonly redoStack: Action[] = [];

	do(action: Action): void {
		action.do(action instanceof CompositeAction);
		this.undoStack.push(action);
		this.redoStack.length = 0;
	}

	undo(): Action | null {
		if (this.undoStack.length === 0) return null;
		TaskLogger.logAction(ApplicationAction.USE_UNDO_SYSTEM, {
			action: "undo",
		});
		const action = this.undoStack.pop() as Action;
		action.undo(action instanceof CompositeAction);
		this.redoStack.push(action);
		return action;
	}

	redo(): Action | null {
		if (this.redoStack.length === 0) return null;
		TaskLogger.logAction(ApplicationAction.USE_UNDO_SYSTEM, {
			action: "redo",
		});
		const action = this.redoStack.pop() as Action;
		action.do(action instanceof CompositeAction);
		this.undoStack.push(action);
		return action;
	}

	getUndoStack(): Action[] {
		return this.undoStack;
	}

	getRedoStack(): Action[] {
		return this.redoStack;
	}

	clear(): void {
		this.undoStack.length = 0;
		this.redoStack.length = 0;
	}
}
