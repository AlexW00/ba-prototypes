import {
	GraphInfo,
	NodeInfo,
	getConnectedNodeIds,
	getNodeById,
} from "./GraphInfo";
import { degreeCentrality } from "./centrality";

export const adamicAdar = (
	nodeA: NodeInfo,
	nodeB: NodeInfo,
	graph: GraphInfo
): number => {
	const nodeANeighbors = getConnectedNodeIds(nodeA),
		nodeBNeighbors = getConnectedNodeIds(nodeB);

	const sharedNeighborIds = nodeANeighbors.filter((nodeId) =>
			nodeBNeighbors.includes(nodeId)
		),
		sharedNeighbors = sharedNeighborIds.map(
			(nodeId) => getNodeById(graph, nodeId)!
		);

	return sharedNeighbors.reduce(
		(acc, node) => acc + 1 / Math.log(degreeCentrality(node)),
		0
	);
};
