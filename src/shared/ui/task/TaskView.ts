import tippy from "tippy.js";
import {
	Toast,
	ToastLength,
	ToastType,
} from "../../../pages/selectionTools/ui/toast/Toast";
import { StudyEvent, studyEventBus } from "../../study/StudyEventBus";
import { Task, TaskState } from "../../study/tasks/Task";
import { View } from "../View";
import "./task.css";

export class TaskView extends View {
	private readonly $container: HTMLDivElement;

	private readonly $taskTitle: HTMLSpanElement;
	private readonly $taskDescription: HTMLSpanElement;
	private readonly $taskProgress: HTMLSpanElement;
	private readonly $taskHelpButton: HTMLButtonElement;
	private readonly $taskStudyProgress: HTMLDivElement;

	private readonly $taskActionsReady: HTMLDivElement;
	private readonly $taskActionsStarted: HTMLDivElement;
	private readonly $taskActionsCompleted: HTMLDivElement;

	private readonly $startButton: HTMLButtonElement;
	private readonly $skipButton: HTMLButtonElement;
	private readonly $finishButton: HTMLButtonElement;

	private skipTimer: any;

	constructor() {
		super();
		this.$container = document.getElementById("task") as HTMLDivElement;
		this.$taskTitle = document.getElementById("task-title") as HTMLSpanElement;
		this.$taskDescription = document.getElementById(
			"task-description"
		) as HTMLSpanElement;
		this.$taskProgress = document.getElementById(
			"task-progress"
		) as HTMLSpanElement;
		this.$taskHelpButton = document.getElementById(
			"task-help-button"
		) as HTMLButtonElement;

		this.$taskActionsReady = document.getElementById(
			"task-actions-ready"
		) as HTMLDivElement;
		this.$taskActionsStarted = document.getElementById(
			"task-actions-started"
		) as HTMLDivElement;
		this.$taskActionsCompleted = document.getElementById(
			"task-actions-completed"
		) as HTMLDivElement;

		this.$startButton = document.getElementById(
			"task-start"
		) as HTMLButtonElement;
		this.$skipButton = document.getElementById(
			"task-skip"
		) as HTMLButtonElement;
		this.$finishButton = document.getElementById(
			"task-finish"
		) as HTMLButtonElement;

		this.$taskStudyProgress = document.getElementById(
			"task-study-progress"
		) as HTMLDivElement;

		this.toggleHtmlListeners(true);
	}
	toggleHtmlListeners = (on: boolean) => {
		if (on) {
			this.$startButton.addEventListener("click", () =>
				studyEventBus.emit(StudyEvent.TASK_START)
			);
			this.$skipButton.addEventListener("click", () => {
				studyEventBus.emit(StudyEvent.TASK_SKIP);
			});
			this.$finishButton.addEventListener("click", () =>
				studyEventBus.emit(StudyEvent.TASK_FINISH)
			);
			this.$taskHelpButton.addEventListener("click", () => {
				studyEventBus.emit(StudyEvent.TASK_HELP);
			});

			tippy(this.$taskHelpButton, {
				content: "Hilfe anzeigen",
				placement: "top",
				duration: 300,
				theme: "dark",
			});
		}
	};

	public updateTitle(title: string): void {
		this.$taskTitle.innerText = title;
	}

	public updateStudyProgress(
		index: number,
		of: number,
		conditionIndex: number
	): void {
		this.$taskStudyProgress.innerText = `Aufgabe ${index}/${of}, Anwendung ${conditionIndex}/2`;
	}

	public updateDescription(description: string): void {
		const isVideo = description.toLowerCase().includes("video");
		if (isVideo) {
			this.$taskDescription.innerText = description;
			this.$taskDescription.style.userSelect = "text";
		} else {
			this.$taskDescription.innerText = "Selektieren Sie " + description;
			this.$taskDescription.style.userSelect = "none";
		}
	}

	public updateProgress(
		current: number,
		total: number,
		other: number,
		info: string | true
	): void {
		this.$taskProgress.innerText = `${current} / ${total} ${
			other > 0 ? `(und ${other} zu viel)` : ""
		} ${info === true ? "" : "(" + info + ")"}`;
	}

	public updateState(state: TaskState): void {
		this.$container.classList.toggle(state.toLowerCase(), true);
		for (const value of Object.values(TaskState)) {
			if (value !== state) {
				this.$container.classList.toggle(value.toLowerCase(), false);
			}
		}

		switch (state) {
			case TaskState.READY:
				this.$container.classList.toggle("completed", false);
				this.$container.classList.toggle("skipped", false);
				this.$taskActionsReady.classList.toggle("hidden", false);
				this.$taskActionsStarted.classList.toggle("hidden", true);
				this.$taskActionsCompleted.classList.toggle("hidden", true);
				break;
			case TaskState.STARTED:
				this.$taskActionsReady.classList.toggle("hidden", true);
				this.$taskActionsStarted.classList.toggle("hidden", false);
				this.$taskActionsCompleted.classList.toggle("hidden", true);
				this.$skipButton.disabled = true;
				const startTime = Date.now();
				this.$skipButton.innerText = `Überspringen(60)`;

				clearInterval(this.skipTimer);
				this.skipTimer = setInterval(() => {
					const time = 90 - Math.floor((Date.now() - startTime) / 1000);
					this.$skipButton.innerText = `Überspringen (${time})`;
					if (time <= 0) {
						this.$skipButton.disabled = false;
						this.$skipButton.innerText = `Überspringen`;
					}
				}, 1000);

				break;

			// completed or skipped
			case TaskState.COMPLETED:
			case TaskState.SKIPPED:
				if (this.skipTimer) clearInterval(this.skipTimer);

				if (state === TaskState.COMPLETED) {
					this.$container.classList.toggle("completed", true);
					new Toast(
						"Aufgabe abgeschlossen",
						ToastType.SUCCESS,
						ToastLength.MEDIUM
					).show();
				} else {
					this.$container.classList.toggle("skipped", true);
					new Toast(
						"Aufgabe übersprungen",
						ToastType.WARNING,
						ToastLength.MEDIUM
					).show();
				}

				this.$taskActionsReady.classList.toggle("hidden", true);
				this.$taskActionsStarted.classList.toggle("hidden", true);
				this.$taskActionsCompleted.classList.toggle("hidden", false);
				break;
		}
	}

	public toggleVisibility(visible: boolean): void {
		this.$container.classList.toggle("hidden", !visible);
	}
}
