import EventEmitter from "events";
import { SelectionTool } from "./SelectionTool";
import { SelectionType } from "./SelectionType";

class TaskLoggerEventBus extends EventEmitter {}

export const taskLoggerEventBus = new TaskLoggerEventBus();

export interface Loggable {
	toLog(): LogEvent;
}

export enum TaskLoggerEventType {
	LOG = "post-log",
	DO_ACTION = "do-action",
}

export class LogEvent {
	static readonly SEPARATOR = "|";

	readonly type: TaskLoggerEventType;
	readonly data: any;
	readonly timestamp: number;

	constructor(type: TaskLoggerEventType, data: any) {
		this.type = type;
		this.data = data;
		this.timestamp = Date.now();
	}

	toCsvLine() {
		return `${this.type}${LogEvent.SEPARATOR}${this.data}${LogEvent.SEPARATOR}${this.timestamp}`;
	}

	static csvHeader() {
		return `type${LogEvent.SEPARATOR}data${LogEvent.SEPARATOR}timestamp`;
	}

	toObject() {
		return {
			type: this.type,
			data: this.data,
			timestamp: this.timestamp,
		};
	}
}

export enum ApplicationAction {
	TOGGLE_SELECTION_MODE = "toggle-selection-mode",
	USE_TOOL = "use-tool",
	USE_FILTER = "use-filter",
	MAKE_SELECTION = "make-selection",
	USE_UNDO_SYSTEM = "use-undo-system",
	DO_TASK = "do-task",
}

export interface ApplicationActionData {
	[ApplicationAction.TOGGLE_SELECTION_MODE]: {
		type: SelectionType;
	};
	[ApplicationAction.USE_TOOL]: {
		tool: SelectionTool;
		data?: any;
	};
	[ApplicationAction.USE_FILTER]: {
		action: "add" | "remove" | "preview" | "switch";
	};
	[ApplicationAction.MAKE_SELECTION]: {
		action: string;
		data: any;
	};
	[ApplicationAction.USE_UNDO_SYSTEM]: {
		action: "undo" | "redo";
	};
	[ApplicationAction.DO_TASK]: {
		action: "start" | "skip" | "finish";
	};
}

export class TaskLogger {
	static logAction<T extends ApplicationAction>(
		action: T,
		data: ApplicationActionData[T]
	) {
		TaskLogger.log(TaskLoggerEventType.DO_ACTION, {
			action,
			data,
		});
	}

	static getLogAction<T extends ApplicationAction>(
		action: T,
		data: ApplicationActionData[T]
	) {
		return new LogEvent(TaskLoggerEventType.DO_ACTION, {
			action,
			data,
		});
	}

	static log(type: TaskLoggerEventType, data: any) {
		TaskLogger.logEvent(new LogEvent(type, data));
	}

	static logEvent(event: LogEvent) {
		console.info("TASK_LOGGGER", event.toObject());
		taskLoggerEventBus.emit(TaskLoggerEventType.LOG, event);
	}
}
