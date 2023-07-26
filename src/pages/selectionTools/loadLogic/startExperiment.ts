import { Router } from "../../../shared/Router";
import { ConditionType } from "../../../shared/study/Models/ExperimentModel";
import { StudyStage } from "../../../shared/study/Models/ProgressModel";
import { PostConditionModel } from "../../../shared/study/Models/ResultsModel";
import { studyEventBus, StudyEvent } from "../../../shared/study/StudyEventBus";
import { Task } from "../../../shared/study/tasks/Task";
import { PostConditionQuestionnaireController } from "../../../shared/ui/postConditionQuestionnaire/PostConditionQuestionnaireController";
import { UEQAnswers } from "../../../shared/ui/postConditionQuestionnaire/UEQ_QUESTIONS";
import TaskController from "../../../shared/ui/task/TaskController";
import { getElements } from "../global/DataManager";
import { onStartControlCondition } from "./startControlCondition";
import { onStartExperimentCondition } from "./startExperimentCondition";
import cytoscape from "cytoscape-select";
import StorageManager from "../../../shared/study/StorageManager";
import { Api } from "../../../shared/study/Api";

const controlApp = document.getElementById("control-app") as HTMLDivElement,
	experimentApp = document.getElementById("experiment-app") as HTMLDivElement;

// block ctrl f default
document.addEventListener("keydown", (e) => {
	if (e.ctrlKey && e.key === "f") {
		e.preventDefault();
	}
});

const toggleAppVisibility = (type: ConditionType, on = true) => {
	if (type === ConditionType.CONTROL) {
		controlApp.classList.toggle("hidden", !on);
		controlApp.style.pointerEvents = on ? "auto" : "none";
	} else {
		experimentApp.classList.toggle("hidden", !on);
		experimentApp.style.pointerEvents = on ? "auto" : "none";
	}
};

export interface ExperimentStarter {
	cy: cytoscape.Core;
	toggleControllers: (on: boolean) => void;
	resetControllers: () => void;
}

export const onStartExperiment = async (
	storageManager: StorageManager,
	participantId: string,
	sendResultsToServer: (
		participantId: string,
		results: string,
		storageManager: StorageManager
	) => Promise<any>
) => {
	const elements = await getElements(),
		progress = storageManager.getProgress(),
		conditionInfo = storageManager.getProgressConditionInfo();

	let cy: cytoscape.Core,
		toggleControllers: (on: boolean) => void,
		resetControllers: () => void;

	if (conditionInfo === null || conditionInfo === undefined) {
		console.warn("No condition info found", progress);
		return;
	} else if (conditionInfo.type === ConditionType.EXPERIMENT) {
		toggleAppVisibility(ConditionType.CONTROL, false);
		({ cy, toggleControllers, resetControllers } = onStartExperimentCondition(
			elements,
			experimentApp
		));
	} else {
		toggleAppVisibility(ConditionType.EXPERIMENT, false);
		({ cy, toggleControllers, resetControllers } = onStartControlCondition(
			elements,
			controlApp
		));
	}
	toggleControllers(false);
	// toggleControllers(true);

	const taskManager = new TaskController(storageManager, cy);

	const postTaskQuestionnaireController =
		new PostConditionQuestionnaireController();

	const togglePostConditionQuestionnaire = (on: boolean) => {
		postTaskQuestionnaireController.toggle(on);
		toggleAppVisibility(conditionInfo.type, !on);
	};

	studyEventBus.addListener(StudyEvent.TASK_FINISHED, (task: Task) => {
		toggleControllers(false);
	});
	studyEventBus.addListener(StudyEvent.TASK_STARTED, () => {
		toggleControllers(true);
	});

	studyEventBus.addListener(StudyEvent.CONDITION_TASKS_COMPLETED, () => {
		togglePostConditionQuestionnaire(true);
	});

	studyEventBus.addListener(StudyEvent.TASK_READY, () => {
		resetControllers();
	});

	const onExperimentComplete = () => {
		const results = storageManager.getResultsString();
		storageManager.setProgressStage(StudyStage.POST_EXPERIMENT);

		sendResultsToServer(participantId, results, storageManager);
	};

	const currentCondition = storageManager.getCurrentCondition();

	if (currentCondition === undefined) onExperimentComplete();

	studyEventBus.addListener(
		StudyEvent.CONDITION_POST_QUESTIONNAIRE_COMPLETED,
		(answers: UEQAnswers) => {
			const conditionInfo = storageManager.getProgressConditionInfo(),
				postConditionModel: PostConditionModel = {
					ueqAnswers: answers,
					conditionType: conditionInfo!.type,
					conditionIndex: conditionInfo!.index,
				};
			storageManager.addResult(postConditionModel);
			const nextConditionModel = storageManager.stepNextCondition();

			if (nextConditionModel === null) {
				onExperimentComplete();
			} else {
				window.location.reload();
			}
		}
	);

	const hasActiveTask = taskManager.loadCurrentTask();
	togglePostConditionQuestionnaire(!hasActiveTask);
};
