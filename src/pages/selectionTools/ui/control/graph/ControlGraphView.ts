import {
	ClickSelectionActionData,
	NeighborsSelectionActionData,
	PathSelectionActionData,
	RectOnlySelectionActionData,
	SelectionTool,
} from "../../../../../shared/study/SelectionTool";
import { SelectionType } from "../../../../../shared/study/SelectionType";
import {
	ApplicationAction,
	TaskLogger,
} from "../../../../../shared/study/TaskLogger";
import { ModifierKey } from "../../../global/KeyboardManager";
import {
	allShortestPaths,
	getCyElementsByIds,
	getNormalSelectionElements,
} from "../../graph/CytoscapeElements";
import { GraphView } from "../../graph/GraphView";
import { Toast, ToastLength, ToastType } from "../../toast/Toast";
import cytoscape from "cytoscape-select";

export class ControlGraphView extends GraphView {
	private selectionType: SelectionType = SelectionType.NEW;

	constructor(cy: cytoscape.Core) {
		super(cy);
		cy.boxSelectionEnabled(true);
	}

	protected onTogglePanning(on: boolean): void {
		// console.log("onTogglePanning");
	}
	protected onCyKeyDown(e: any): void {
		// console.log("onCyKeyDown");
	}
	protected onCyKeyUp(e: any): void {
		// console.log("onCyKeyUp");
	}

	override onBoxSelect = (nodes: any[], dataAtFirstClick: any) => {
		const selectionType = dataAtFirstClick.selectionType,
			nodesAsCollection = this.cy.collection(nodes),
			tool = SelectionTool.RECT_ONLY;

		TaskLogger.logAction(ApplicationAction.USE_TOOL, { tool });

		const [elementsToSelect, elementsToUnselect] = getNormalSelectionElements(
			nodesAsCollection,
			selectionType,
			this.cy
		);

		const addSelectionActionData: RectOnlySelectionActionData = {
				elementIds: elementsToSelect.map((ele: any) => ele.id()),
			},
			removeSelectionActionData: RectOnlySelectionActionData = {
				elementIds: elementsToUnselect.map((ele: any) => ele.id()),
			};

		this.setSelection(
			addSelectionActionData,
			removeSelectionActionData,
			tool,
			selectionType
		);
	};

	protected getDataAtFirstClick(_modifierKeys: ModifierKey[]) {
		return {
			selectionType: this.selectionType,
		};
	}
	protected _onNormalClickNode = (event: any, dataAtClick: any) => {
		const clickedNode = event.target!,
			selectionType = dataAtClick.selectionType,
			tool = SelectionTool.CLICK;

		TaskLogger.logAction(ApplicationAction.USE_TOOL, { tool });

		const elementsToSelect: any[] = [],
			elementsToUnselect: any[] = [];
		if (selectionType === SelectionType.NEW) {
			elementsToSelect.push(clickedNode);
			elementsToUnselect.push(
				...this.cy.$(":selected").difference(clickedNode)
			);
		} else if (selectionType === SelectionType.ADD) {
			if (clickedNode.selected()) {
				elementsToUnselect.push(clickedNode);
			} else {
				elementsToSelect.push(clickedNode);
			}
		} else {
			elementsToUnselect.push(clickedNode);
		}

		const addSelectionActionData: ClickSelectionActionData = {
				elementIds: elementsToSelect.map((ele) => ele.id()),
				didClickCanvas: false,
			},
			removeSelectionActionData: ClickSelectionActionData = {
				elementIds: elementsToUnselect.map((ele) => ele.id()),
				didClickCanvas: false,
			};

		this.setSelection(
			addSelectionActionData,
			removeSelectionActionData,
			tool,
			selectionType
		);
	};
	protected onDoubleClickNode = (clickedNode: any, dataAtClick: any) => {
		// console.log("onDoubleClickNode");
	};
	protected _onHoverNode = (event: any) => {
		// console.log("onHoverNode");
	};
	protected onHoverNodeEnd = (event: any) => {
		// console.log("onHoverNodeEnd");
	};

	// ~~~~~~~~~~~~~~ Selection ~~~~~~~~~~~~~~ //

	public performNeighborSelection(selectionType: SelectionType) {
		const allElements = this.cy.elements(),
			selectedElements = this.cy.$(":selected");
		if (selectedElements.length === 0) {
			new Toast(
				"Bitte wählen Sie mindestens einen Knoten aus um dessen Nachbarn zu selektieren.",
				ToastType.ERROR,
				ToastLength.LONG
			).show();
		} else {
			const neighborElements = selectedElements.neighborhood();

			const elementsToSelect = neighborElements.difference(selectedElements);

			const addSelectionActionData: NeighborsSelectionActionData = {
					elementIds: elementsToSelect.map((ele: any) => ele.id()),
					isDirectNeighbors: selectedElements.length === 1,
				},
				removeSelectionActionData: NeighborsSelectionActionData = {
					elementIds: [],
					isDirectNeighbors: selectedElements.length === 1,
				};

			this.setSelection(
				addSelectionActionData,
				removeSelectionActionData,
				SelectionTool.NEIGHBORS,
				selectionType
			);
		}
	}

	public performPathSelection(selectionType: SelectionType) {
		const selectedElements = this.cy.$(":selected");
		if (selectedElements.length !== 2) {
			// german
			new Toast(
				"Bitte wählen Sie genau zwei Knoten aus um einen Pfad zu selektieren.",
				ToastType.ERROR,
				ToastLength.LONG
			).show();
		} else {
			const availablePaths = allShortestPaths(
				this.cy,
				selectedElements[0].id(),
				selectedElements[1].id()
			);
			if (availablePaths.length === 0) {
				new Toast(
					"Es existiert kein Pfad zwischen den ausgewählten Knoten.",
					ToastType.ERROR,
					ToastLength.LONG
				).show();
			} else {
				const pathElementIds = availablePaths[0];
				const elementsToSelect = getCyElementsByIds(pathElementIds, this.cy),
					elementsToUnselect = this.cy
						.elements()
						.filter((ele: any) => elementsToSelect.indexOf(ele) === -1);

				const addSelectionActionData: PathSelectionActionData = {
						elementIds: pathElementIds,
						toggleCount: 0,
					},
					removeSelectionActionData: PathSelectionActionData = {
						elementIds: elementsToUnselect.map((ele: any) => ele.id()),
						toggleCount: 0,
					};

				this.setSelection(
					addSelectionActionData,
					removeSelectionActionData,
					SelectionTool.PATH,
					selectionType
				);
			}
		}
	}

	// ~~~~~~~~~~~~~~~ Misc Setters ~~~~~~~~~~~~~~~ //

	protected onReset = () => {
		this.setSelectionType(SelectionType.NEW);
	};

	public setSelectionType(selectionType: SelectionType) {
		this.selectionType = selectionType;
	}

	public getSelectionType(): SelectionType {
		return this.selectionType;
	}

	// ~~~~~~~~~~~~~~~~ Show hide nodes ~~~~~~~~~~~~~~~ //

	public showAllNodes() {
		// hide all nodes
		this.cy.elements().removeClass("filtered").show();
	}

	hideSelectedNodes() {
		this.cy.$(":selected").addClass("filtered").unselect().hide();
	}

	hideUnselectedNodes() {
		this.cy
			.elements()
			.difference(this.cy.$(":selected"))
			.addClass("filtered")
			.hide();
	}
}
