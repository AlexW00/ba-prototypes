import { NodeInfo, getConnectedNodeIds } from "./GraphInfo";

export const jaccardCoefficient = (
	nodeA: NodeInfo,
	nodeB: NodeInfo
): number => {
	const nodeANeighbors = getConnectedNodeIds(nodeA),
		nodeBNeighbors = getConnectedNodeIds(nodeB);

	const intersection = nodeANeighbors.filter((edge) =>
		nodeBNeighbors.includes(edge)
	);
	const union = [...nodeANeighbors, ...nodeBNeighbors];

	return intersection.length / union.length;
};
