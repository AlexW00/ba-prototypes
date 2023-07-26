import { NodeInfo } from "./GraphInfo";

export const preferentialAttachmentScore = (
	nodeA: NodeInfo,
	nodeB: NodeInfo
): number => {
	return nodeA.edges.length * nodeB.edges.length;
};
