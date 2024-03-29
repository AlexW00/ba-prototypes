import cytoscape from "cytoscape-select";
import { View } from "../../../../shared/ui/View";

import { ActionManager } from "../../../../shared/extensions/undo/ActionManager";
import { Action } from "../../../../shared/extensions/undo/actions/Action";
import { AddSelectionAction } from "../../../../shared/extensions/undo/actions/AddSelectionAction";
import { CompositeAction } from "../../../../shared/extensions/undo/actions/CompositeAction";
import { RemoveSelectionAction } from "../../../../shared/extensions/undo/actions/RemoveSelectionAction";
import {
	SelectionType,
	getSelectionType,
} from "../../../../shared/study/SelectionType";
import { experimentEventBus } from "../../global/ExperimentEventBus";
import {
	ModifierKey,
	fromEvent,
	isModifierActive,
} from "../../global/KeyboardManager";
import { initNodeHtmlLabel, initUndoRedo } from "./CytoscapeExtensions";
import { getAllSelectionElements } from "./CytoscapeElements";
import { zoom } from "./CytoscapeView";
import {
	AllSelectionActionData,
	ClickSelectionActionData,
	InvertSelectionActionData,
	SelectionActionDataMap,
	SelectionTool,
} from "../../../../shared/study/SelectionTool";
import { controlEventBus } from "../../global/ControlEventBus";
import {
	ApplicationAction,
	TaskLogger,
} from "../../../../shared/study/TaskLogger";

export enum GraphViewEvents {
	SELECTION_CHANGED = "selectionChanged",
	LAST_CLICKED_CHANGED = "lastClickedChanged",
}

export abstract class GraphView extends View {
	protected readonly cy: any;
	protected readonly actionManager: ActionManager;

	private selectEventTimeout: any;
	private isPanning: boolean = false;

	private dataAtFirstClick: any = {};
	private isWaitingForDoubleClick: boolean = false;

	constructor(cy: cytoscape.Core) {
		super();
		this.cy = cy;

		initNodeHtmlLabel(this.cy);
		this.actionManager = initUndoRedo(this.cy);

		this.cy.userPanningEnabled(false);
		this.cy.boxSelectionEnabled(false);
		this.cy.nodes().grabify();
		this.cy.nodes().selectify();
		// set max zoom
		this.cy.minZoom(0.3);
		// make all edges unselectable
		this.cy.edges().unselectify();
	}

	toggleHtmlListeners(on: boolean): void {
		if (on) {
			this.cy.on("click", this.onAtomicClick);
			this.cy.on("select unselect", this.onSelectionChanged);
			this.cy.on("multiSelect", this.onMultiSelect);
			this.cy.on("mouseover", "node", this._onHoverNode);
			this.cy.on("mouseout", "node", this.onHoverNodeEnd);
			this.cy.on("boxselect", this._onBoxSelect);
		} else {
			this.cy.removeListener("click", this.onAtomicClick);
			this.cy.removeListener("select unselect", this.onSelectionChanged);
			this.cy.removeListener("multiSelect", this.onMultiSelect);
			this.cy.removeListener("mouseover", "node", this._onHoverNode);
			this.cy.removeListener("mouseout", "node", this.onHoverNodeEnd);
			this.cy.removeListener("boxselect", this._onBoxSelect);
		}
	}

	private readonly boxSelectElementBuffer: any[] = [];
	boxSelectElementTimeout: any = null;

	private _onBoxSelect = (e: any) => {
		const element = e.target;
		if (element.isNode()) {
			this.boxSelectElementBuffer.push(element);

			if (!this.boxSelectElementTimeout) {
				const modifierKeys = fromEvent(e);
				this.boxSelectElementTimeout = setTimeout(() => {
					this.boxSelectElementTimeout = null;
					this.onBoxSelect(
						[...this.boxSelectElementBuffer],
						this.getDataAtFirstClick(modifierKeys)
					);
					this.boxSelectElementBuffer.length = 0;
				}, 25);
			}
		}
	};

	protected onBoxSelect(elements: any[], dataAtFirstClick: any) {}

	// ~~~~~~~~~~~ Mouse listeners ~~~~~~~~~~~ //

	public onWheel = (e: any) => {
		if (isModifierActive(fromEvent(e), ModifierKey.SHIFT)) {
			zoom(this.cy, -e.deltaY, 0.0004, e);
		} else {
			zoom(this.cy, -e.deltaY, 0.002, e);
		}
	};

	public onMousedown = (e: any) => {
		if (this.doActivatePanning(e)) {
			this.isPanning = true;
			this.onTogglePanning(true);
			// this.lassoSelection.toggle(false);
		}
	};

	public onMouseUp = (e: any) => {
		if (this.isPanning) {
			this.isPanning = false;
			// this.lassoSelection.toggle(true);
			this.onTogglePanning(false);
		}
	};

	protected abstract onTogglePanning(on: boolean): void;

	public onMouseMove = (e: any) => {
		if (this.isPanning) {
			this.cy.panBy({
				x: e.movementX,
				y: e.movementY,
			});
		}
	};

	// ~~~~~~~~~~ Keyboard Listeners ~~~~~~~~~ //

	public onKeydown = (e: any) => {
		console.log(e);
		const isInputElement = e.target instanceof HTMLInputElement;

		// return if ctrl a
		if (e.key === "a" && e.ctrlKey && isInputElement) return;
		if (e.key === "z" && e.ctrlKey) this.undo();
		else if (e.key === "y" && e.ctrlKey) {
			e.preventDefault();
			this.redo();
		}
		this.onCyKeyDown(e);
	};

	public onKeyUp = (e: any) => {
		this.onCyKeyUp(e);
	};

	// ---- Keyboard Events --- //

	public selectAll = (selectionType: SelectionType) => {
		const tool = SelectionTool.ALL;
		TaskLogger.logAction(ApplicationAction.USE_TOOL, {
			tool,
		});
		const [elementIdsToSelect, elementIdsToUnselect] = getAllSelectionElements(
				this.cy,
				selectionType
			).map((elements) => elements.map((element: any) => element.id())),
			addSelectionActionData: AllSelectionActionData = {
				elementIds: elementIdsToSelect,
			},
			removeSelectionActionData: AllSelectionActionData = {
				elementIds: elementIdsToUnselect,
			};

		this.setSelection(
			addSelectionActionData,
			removeSelectionActionData,
			tool,
			selectionType
		);
	};

	public invertSelection = () => {
		const tool = SelectionTool.INVERT;
		TaskLogger.logAction(ApplicationAction.USE_TOOL, {
			tool,
		});
		const selectedElements = this.cy.elements(":selected"),
			selectedElementsIds = selectedElements.map((element: any) =>
				element.id()
			),
			unselectedElements = this.cy.elements().difference(selectedElements),
			unselectedElementsIds = unselectedElements.map((element: any) =>
				element.id()
			),
			addInvertSelectionActionData: InvertSelectionActionData = {
				elementIds: unselectedElementsIds,
			},
			removeInvertSelectionActionData: InvertSelectionActionData = {
				elementIds: selectedElementsIds,
			};

		this.setSelection(
			addInvertSelectionActionData,
			removeInvertSelectionActionData,
			tool,
			SelectionType.NEW
		);
	};

	// ~~~~~~~~~ Cytoscape listeners ~~~~~~~~~ //

	protected abstract onCyKeyDown(e: any): void;
	protected abstract onCyKeyUp(e: any): void;

	// ----- Click Events ----- //

	private lastClickTs: number = 0;
	private onAtomicClick = (event: any) => {
		if (this.lastClickTs + 10 > event.timeStamp) return;

		this.lastClickTs = event.timeStamp;
		const modifierKeys = fromEvent(event.originalEvent as MouseEvent);

		if (this.isWaitingForDoubleClick) {
			this.isWaitingForDoubleClick = false;
			this.onDoubleClick(event, this.dataAtFirstClick);
		} else {
			this.isWaitingForDoubleClick = true;
			this.dataAtFirstClick = this.getDataAtFirstClick(modifierKeys);
			setTimeout(() => {
				if (this.isWaitingForDoubleClick) {
					this.isWaitingForDoubleClick = false;
					this.onNormalClick(event, this.dataAtFirstClick);
					this.resetDataAtFirstClick();
				}
			}, 200);
		}
	};

	protected abstract getDataAtFirstClick(modifierKeys: ModifierKey[]): any;

	private resetDataAtFirstClick = () => {
		this.dataAtFirstClick = {};
		this.isWaitingForDoubleClick = false;
	};

	private onNormalClick = (event: any, dataAtClick: any) => {
		const isCanvas = event.target === this.cy;
		if (isCanvas) this.onNormalClickCanvas();
		else {
			const isNode = event.target.isNode();
			if (isNode) this._onNormalClickNode(event, dataAtClick);
		}
		this.resetDataAtFirstClick();
	};

	private onNormalClickCanvas = () => {
		const elementIds = this.cy.$(":selected").map((ele: any) => ele.id());
		const removeSelectionData: ClickSelectionActionData = {
			didClickCanvas: true,
			elementIds,
		};
		this.setSelection(
			null,
			removeSelectionData,
			SelectionTool.CLICK,
			SelectionType.NEW
		);
		this.clearLastClicked();
	};

	protected abstract _onNormalClickNode: (event: any, dataAtClick: any) => void;

	private onDoubleClick = (event: any, dataAtClick: any) => {
		const isNode = event.target.isNode();
		if (isNode) this.onDoubleClickNode(event.target, dataAtClick);
		this.resetDataAtFirstClick();
	};

	protected abstract onDoubleClickNode: (
		clickedNode: any,
		dataAtClick: any
	) => void;

	// --- Selection Events --- //

	private onSelectionChanged = (event: any) => {
		if (event.target.isNode()) {
			if (!this.selectEventTimeout)
				this.selectEventTimeout = setTimeout(() => {
					const selectedNodes = this.cy.$(":selected").map((n: any) => n.id());
					experimentEventBus.emit(
						GraphViewEvents.SELECTION_CHANGED,
						selectedNodes
					);
					controlEventBus.emit(
						GraphViewEvents.SELECTION_CHANGED,
						selectedNodes
					);
					this.selectEventTimeout = null;
				}, 10);
		}
	};

	protected onMultiSelect = <T extends SelectionTool>(
		_e: any,
		...data: [AddSelectionAction<T> | null, RemoveSelectionAction<T> | null]
	) => {
		const [addSelectionAction, removeSelectionAction] = data;

		let actionToDo: Action;

		if (
			addSelectionAction &&
			addSelectionAction.numElements() > 0 &&
			removeSelectionAction &&
			removeSelectionAction.numElements() > 0
		) {
			actionToDo = new CompositeAction([
				addSelectionAction,
				removeSelectionAction,
			]);
		} else if (addSelectionAction && addSelectionAction.numElements() > 0) {
			actionToDo = addSelectionAction;
		} else if (
			removeSelectionAction &&
			removeSelectionAction.numElements() > 0
		) {
			actionToDo = removeSelectionAction;
		} else return;

		this.actionManager.do(actionToDo);
	};

	// --- Hover Events --- //

	protected abstract _onHoverNode: (event: any) => void;
	protected abstract onHoverNodeEnd: (event: any) => void;

	// ~~~~~~~~~~ Protected Logic ~~~~~~~~~~ //

	public setSelection = <T extends SelectionTool>(
		addSelectionData: SelectionActionDataMap[T] | null,
		removeSelectionData: SelectionActionDataMap[T] | null,
		tool: T,
		type: SelectionType
	) => {
		const addSelectionAction = addSelectionData
				? new AddSelectionAction(this.cy, tool, type, addSelectionData)
				: null,
			removeSelectionAction = removeSelectionData
				? new RemoveSelectionAction(this.cy, tool, type, removeSelectionData)
				: null;

		this.cy.emit("multiSelect", [addSelectionAction, removeSelectionAction]);
	};

	public setLastClicked(clickedNode: any) {
		this.cy.nodes().removeClass("last-clicked");
		clickedNode.addClass("last-clicked");
		experimentEventBus.emit(
			GraphViewEvents.LAST_CLICKED_CHANGED,
			clickedNode.id()
		);
		controlEventBus.emit(
			GraphViewEvents.LAST_CLICKED_CHANGED,
			clickedNode.id()
		);
	}

	// ~~~~~~~~~~ Private Logic ~~~~~~~~~~ //

	private clearLastClicked() {
		this.cy.$("node.last-clicked").removeClass("last-clicked");
	}

	private doActivatePanning(event: MouseEvent) {
		return (
			event.button === 1 ||
			event.button === 2 ||
			isModifierActive(fromEvent(event), ModifierKey.SPACE)
		);
	}

	// -------- Actions ------- //

	do(action: Action) {
		this.actionManager.do(action);
	}

	undo(): Action | null {
		return this.actionManager.undo();
	}

	redo(): Action | null {
		return this.actionManager.redo();
	}

	clearActions() {
		this.actionManager.clear();
	}

	// ------ Getters ------ //

	getSelectedNodes() {
		return this.cy.$(":selected");
	}

	getCy() {
		return this.cy;
	}

	getNodeById(id: string) {
		return this.cy.getElementById(id);
	}

	// -------- Setters ------- //

	reset = () => {
		this.clearActions();

		this.cy.elements().removeClass("last-clicked incoming outgoing dimmed");

		this.cy.elements().unselect();

		this.cy
			.layout({
				name: "fcose",
			})
			.run();
		this.isPanning = false;
		this.dataAtFirstClick = {};
		this.isWaitingForDoubleClick = false;
		this.onReset();
	};

	protected abstract onReset: () => void;
}
