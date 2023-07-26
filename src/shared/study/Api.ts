import { ExperimentModel } from "./Models/ExperimentModel";

export class Api {
	private static readonly apiUrl: string = window.location.origin + "/api";

	private static readonly postRoute: string = "/postResults";
	private static readonly getExperimentModelRoute: string = "/experimentModel";

	public static async getExperimentModel(): Promise<ExperimentModel> {
		console.log("Fetching experiment model");
		const url = this.apiUrl + this.getExperimentModelRoute;

		return fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}).then((response) => {
			if (response.status === 200) {
				console.log("Experiment model fetched");

				return response.json();
			} else {
				console.log("Error while fetching experiment model");
				throw new Error("Error while fetching experiment model");
			}
		});
	}

	// Post the results to the server
	public static async postResults(
		participantId: string,
		results: string
	): Promise<boolean> {
		const url = this.apiUrl + this.postRoute;

		const data = {
			results,
			participantId,
		};
		try {
			const res = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			return res.status === 200;
		} catch (e) {
			console.error("catched", e);
			return false;
		}
	}
}
