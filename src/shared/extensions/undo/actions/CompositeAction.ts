import { studyEventBus, StudyEvent } from "../../../study/StudyEventBus";
import { Action } from "./Action";

export class CompositeAction<T extends Action> extends Action {
	private readonly actions: T[];

	constructor(actions: T[]) {
		super();
		this.actions = actions;
	}

	do(): void {
		this.actions.forEach((a) => a.do(true));
		studyEventBus.emit(StudyEvent.SELECTION_CHANGED, this);
	}

	undo(): void {
		this.actions.forEach((a) => a.undo(true));
		studyEventBus.emit(StudyEvent.SELECTION_CHANGED, this);
	}

	length() {
		return this.actions.length;
	}

	getActions() {
		return this.actions;
	}

	getData() {
		return this.actions.map((a) => a.getData());
	}

	getName(): string {
		return "CompositeAction";
	}
}
