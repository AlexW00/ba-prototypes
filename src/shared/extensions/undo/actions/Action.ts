import {
	Loggable,
	LogEvent,
	TaskLoggerEventType,
	ApplicationAction,
	TaskLogger,
} from "../../../study/TaskLogger";

export abstract class Action implements Loggable {
	abstract do(isComposite: boolean): void;

	abstract undo(isComposite: boolean): void;

	abstract getData(): any;

	abstract getName(): string;

	public toLog(): LogEvent {
		return TaskLogger.getLogAction(ApplicationAction.MAKE_SELECTION, {
			action: this.getName(),
			data: this.getData(),
		});
	}
}
