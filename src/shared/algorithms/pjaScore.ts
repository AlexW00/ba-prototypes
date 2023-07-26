import { jaccardCoefficient } from "./jaccardCoefficient";
import { preferentialAttachmentScore } from "./preferentialAttachmentScore";
import { NodeInfo } from "./GraphInfo";

export const pjaScore = (nodeA: NodeInfo, nodeB: NodeInfo): number => {
	const jScore = jaccardCoefficient(nodeA, nodeB),
		paScore = Math.max(preferentialAttachmentScore(nodeA, nodeB), 1);

	// console.log("jScore: " + jScore + " paScore: " + paScore);
	return jScore * paScore;
};
