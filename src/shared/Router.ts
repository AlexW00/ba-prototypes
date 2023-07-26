import { StudyStage } from "./study/Models/ProgressModel";

export abstract class Router {
	private static readonly baseUrl = window.location.origin;

	private static readonly routes = {
		[StudyStage.PRE_EXPERIMENT]:
			"https://docs.google.com/forms/d/e/1FAIpQLSeEbGPiaYjllp4XFwwy3PvAN_uWWQkodVwc6eudl_wSQUqmzQ/viewform?usp=pp_url&entry.961204165=PARTICIPANT_ID",
		[StudyStage.EXPERIMENT]: window.location.pathname,
		[StudyStage.POST_EXPERIMENT]:
			"https://docs.google.com/forms/d/e/1FAIpQLScsnzhu7uXbqjdeVJEXglvrvB5j-e1zIMR7aZSMMuIOKbgeWA/viewform?usp=pp_url&entry.961204165=PARTICIPANT_ID",
	};

	private static fillGoogleFormUrl(
		participantId: string,
		googleFormUrl: string
	) {
		return googleFormUrl.replace("PARTICIPANT_ID", participantId);
	}

	public static getStudyStageFromUrlParams(): StudyStage | null {
		const urlParams = new URLSearchParams(window.location.search);
		const stage = urlParams.get("stage");
		if (stage !== null) {
			return stage as StudyStage;
		} else return null;
	}

	public static getUrl(stage: StudyStage, participantId: string): URL {
		if (stage === StudyStage.EXPERIMENT)
			return new URL(this.routes[stage], this.baseUrl);
		else {
			const route = this.routes[stage],
				href = this.fillGoogleFormUrl(participantId, route);
			return new URL(href);
		}
	}

	public static redirect(stage: StudyStage, participantId: string): boolean {
		console.log("Redirecting to", stage, participantId);
		const url = this.getUrl(stage, participantId);
		console.log("Redirecting to", url.href, stage);
		if (url.href !== window.location.href) {
			window.location.href = url.href;
			return true;
		}
		return false;
	}
}
