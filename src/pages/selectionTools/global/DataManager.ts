import { ElementDefinition } from "cytoscape";
import completeGraph from "../../../data/complete.json";

export const getElements = async (): Promise<ElementDefinition[]> => {
	return completeGraph as ElementDefinition[];
};
