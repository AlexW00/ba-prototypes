import { ViewController } from "../ViewController";
import { PostConditionQuestionnaireView } from "./PostConditionQuestionnaireView";

export class PostConditionQuestionnaireController extends ViewController<PostConditionQuestionnaireView> {
	constructor() {
		super(new PostConditionQuestionnaireView());
	}

	protected toggleListeners(on: boolean): void {}
	public reset(): void {
		// console.log("reset");
	}

	public toggle(on: boolean): void {
		this.view.toggleVisibility(on);
	}
}
