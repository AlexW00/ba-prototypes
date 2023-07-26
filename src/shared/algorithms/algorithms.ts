import { GraphInfo, NodeInfo, getOtherNodes } from "./GraphInfo";
import { adamicAdar } from "./adamicAdar";
import { pjaScore } from "./pjaScore";

export const linkSuggestions = (
	node: NodeInfo,
	graph: GraphInfo,
	threshold: number
): NodeInfo[] => {
	const otherNodes = getOtherNodes(graph, node).filter((otherNode) =>
		otherNode.edges.every(
			(edge) => edge.source !== node.id && edge.target !== node.id
		)
	);

	const pjaScores = otherNodes.map((otherNode) => pjaScore(node, otherNode)),
		suggestions = otherNodes.filter(
			(otherNode, index) => pjaScores[index] > threshold
		);

	return suggestions;
};

export const explanatoryNodes = (
	node: NodeInfo,
	graph: GraphInfo,
	threshold: number
): NodeInfo[] => {
	const otherNodes = getOtherNodes(graph, node);

	const adamicAdarScores = otherNodes.map((otherNode) =>
		adamicAdar(node, otherNode, graph)
	);

	const suggestions = otherNodes.filter(
		(otherNode, index) => adamicAdarScores[index] > threshold
	);

	return suggestions;
};
