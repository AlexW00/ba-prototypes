import {
	Toast,
	ToastLength,
	ToastType,
} from "../../../pages/selectionTools/ui/toast/Toast";
import { StudyEvent, studyEventBus } from "../../study/StudyEventBus";
import { View } from "../View";
import { UEQ_QUESTIONS } from "./UEQ_QUESTIONS";
import "./postConditionQuestionnaire.css";

export class PostConditionQuestionnaireView extends View {
	private readonly $container: HTMLDivElement;
	private readonly $ueq: HTMLDivElement;
	private readonly $submitButton: HTMLButtonElement;

	constructor() {
		super();

		this.$container = document.getElementById(
			"post-condition-questionnaire"
		) as HTMLDivElement;
		this.$ueq = document.getElementById("ueq") as HTMLDivElement;
		this.$submitButton = document.getElementById(
			"post-condition-questionnaire-submit"
		) as HTMLButtonElement;

		this.generateUEQ();
		this.toggleHtmlListeners(true);
	}

	private generateUEQ() {
		UEQ_QUESTIONS.forEach((question, index) => {
			const questionContainer = document.createElement("div");
			questionContainer.className = "question";

			const label1 = document.createElement("span");
			label1.className = "label left";
			label1.textContent = question[0];
			questionContainer.appendChild(label1);

			const scale = document.createElement("div");
			scale.className = "scale";
			for (let i = 1; i <= 7; i++) {
				const radio = document.createElement("input");
				radio.type = "radio";
				radio.name = "question" + index;
				radio.value = i.toString();
				scale.appendChild(radio);
			}
			questionContainer.appendChild(scale);

			const label2 = document.createElement("span");
			label2.className = "label right";
			label2.textContent = question[1];
			questionContainer.appendChild(label2);

			this.$ueq.appendChild(questionContainer);
		});
	}

	private getUEQAnswers(): number[] {
		const answers: number[] = [];
		const radios = this.$ueq.querySelectorAll("input[type=radio]:checked");
		radios.forEach((radio: any) => {
			answers.push(parseInt(radio.value));
		});
		return answers;
	}

	private validateUEQAnswers(): boolean {
		const radios = this.$ueq.querySelectorAll("input[type=radio]:checked");
		return radios.length === UEQ_QUESTIONS.length;
	}

	private onSubmitButtonClick = () => {
		if (!this.validateUEQAnswers()) {
			new Toast(
				"Please answer all questions.",
				ToastType.ERROR,
				ToastLength.MEDIUM
			).show();
			return;
		}

		const answers = this.getUEQAnswers();
		studyEventBus.emit(
			StudyEvent.CONDITION_POST_QUESTIONNAIRE_COMPLETED,
			answers
		);
	};

	toggleHtmlListeners(on: boolean): void {
		if (on) {
			this.$submitButton.addEventListener("click", this.onSubmitButtonClick);
		} else {
			this.$submitButton.removeEventListener("click", this.onSubmitButtonClick);
		}
	}

	toggleVisibility(on: boolean): void {
		this.$container.classList.toggle("hidden", !on);
	}
}
