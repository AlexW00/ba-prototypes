import {
	SearchSelectionActionData,
	SelectionTool,
} from "../../../../../shared/study/SelectionTool";
import { SelectionType } from "../../../../../shared/study/SelectionType";
import { controlEventBus } from "../../../global/ControlEventBus";
import { getNormalSelectionElements } from "../../graph/CytoscapeElements";
import { GraphController } from "../../graph/GraphController";
import {
	SharedEventBusEvent,
	sharedEventBus,
} from "../../shared/SharedEventBus";
import { ActionBarEvents } from "../actionBar/ActionBarController";
import { ActionBarViewEvent } from "../actionBar/ActionBarView";
import { ControlGraphView } from "./ControlGraphView";
import cytoscape from "cytoscape-select";

export class ControlGraphController extends GraphController<ControlGraphView> {
	constructor(cy: cytoscape.Core) {
		super(new ControlGraphView(cy));
		this.initEventBusListeners();
	}

	private initEventBusListeners = () => {
		controlEventBus.on(ActionBarEvents.CLICK_SELECT_ALL, this.onSelectAll);
		controlEventBus.on(
			ActionBarEvents.CLICK_INVERT_SELECTION,
			this.onInvertSelection
		);

		controlEventBus.on(ActionBarEvents.CLICK_SELECT_PATH, this.onSelectPath);

		controlEventBus.on(
			ActionBarEvents.CLICK_SELECT_NEIGHBORS,
			this.onSelectNeighbors
		);

		controlEventBus.on(
			ActionBarEvents.CLICK_SHOW_ALL_NODES,
			this.onShowAllNodes
		);
		controlEventBus.on(
			ActionBarEvents.CLICK_HIDE_SELECTED_NODES,
			this.onHideSelectedNodes
		);
		controlEventBus.on(
			ActionBarEvents.CLICK_HIDE_UNSELECTED_NODES,
			this.onHideUnselectedNodes
		);
		controlEventBus.on(
			ActionBarViewEvent.CLICK_SEARCH_RESULT,
			this.onSearchResultClicked
		);
		sharedEventBus.on(
			SharedEventBusEvent.SELECTION_TYPE_CHANGED,
			this.onSelectionTypeChanged
		);
	};
	private onSearchResultClicked = (
		nodeId: string,
		query: string,
		property: string
	) => {
		const tool = SelectionTool.SEARCH,
			selectionType = this.view.getSelectionType();

		const selectedNodes = this.view.getSelectedNodes(),
			clickedNode = this.view.getNodeById(nodeId);

		const [nodesToSelect, nodesToUnselect] = getNormalSelectionElements(
				[clickedNode],
				selectionType,
				this.view.getCy()
			),
			nodeIdsToSelect = nodesToSelect.map((n: any) => n.id()),
			nodeIdsToUnselect = nodesToUnselect.map((n: any) => n.id());

		const addSelectionActionData: SearchSelectionActionData = {
				elementIds: nodeIdsToSelect,
				query,
				property,
			},
			removeSelectionActionData: SearchSelectionActionData = {
				elementIds: nodeIdsToUnselect,
				query,
				property,
			};

		this.view.setSelection(
			addSelectionActionData,
			removeSelectionActionData,
			tool,
			selectionType
		);
	};

	private onSelectionTypeChanged = (selectionType: SelectionType) => {
		this.view.setSelectionType(selectionType);
	};

	private onSelectAll = () => {
		this.view.selectAll(this.view.getSelectionType());
	};

	private onInvertSelection = () => {
		this.view.invertSelection();
	};

	private onSelectPath = () => {
		this.view.performPathSelection(this.view.getSelectionType());
	};

	private onSelectNeighbors = () => {
		this.view.performNeighborSelection(this.view.getSelectionType());
	};

	private onShowAllNodes = () => {
		this.view.showAllNodes();
	};

	private onHideSelectedNodes = () => {
		this.view.hideSelectedNodes();
	};

	private onHideUnselectedNodes = () => {
		this.view.hideUnselectedNodes();
	};
}
