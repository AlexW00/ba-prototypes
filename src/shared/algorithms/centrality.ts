import { NodeInfo } from "./GraphInfo";

export const degreeCentrality = (node: NodeInfo): number => {
	return node.edges.length;
};
