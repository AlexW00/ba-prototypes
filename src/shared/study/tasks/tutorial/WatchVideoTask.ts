import { CompositeAction } from "../../../extensions/undo/actions/CompositeAction";
import { SelectionAction } from "../../../extensions/undo/actions/SelectionAction";
import { ConditionInfo } from "../../Models/ExperimentModel";
import { WatchVideoTaskModel } from "../../Models/TaskModel";
import { Task } from "../Task";
import cytoscape from "cytoscape-select";

export class WatchVideoTask extends Task implements WatchVideoTaskModel {
	link: string;
	length: number;
	private hasWatchedVideo: boolean = false;

	constructor(
		model: WatchVideoTaskModel,
		conditionInfo: ConditionInfo,
		cy: cytoscape.Core,
		[relativeIndex, absoluteIndex]: [number, number]
	) {
		super(model, conditionInfo, cy, [relativeIndex, absoluteIndex]);
		this.link = model.link;
		this.length = model.length;
	}

	private secondsToMinutesFormatted(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
	}

	public getDescription(): string {
		return `Tutorial video ansehen (automatisch nach ${this.secondsToMinutesFormatted(
			this.length
		)} Minuten abgeschlossen)`;
	}

	getTitle(): string {
		return "Video ansehen (Tutorial)";
	}

	public hasSatisfiedAdditionalRequirements() {
		return this.hasWatchedVideo ? true : `Video link: ${this.link}`;
	}

	public getProgress(): [number, number, number] {
		return [this.hasWatchedVideo ? 1 : 0, 1, 0];
	}

	protected onStart(): void {
		super.onStart();
		// open link in new tab
		window.open(this.link, "_blank");

		setTimeout(() => {
			this.hasWatchedVideo = true;
			this.complete();
		}, this.length * 1000);
	}

	protected onAction(
		action: SelectionAction<any> | CompositeAction<SelectionAction<any>>
	): void {}
}
