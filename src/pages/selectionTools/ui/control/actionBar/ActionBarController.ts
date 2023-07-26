import {
	FuzzySearch,
	FuzzySearchManager,
} from "../../../../../shared/classes/FuzzySearch";
import { SelectionTool } from "../../../../../shared/study/SelectionTool";
import {
	SELECTION_TYPE_LABEL_MAP,
	SelectionType,
} from "../../../../../shared/study/SelectionType";
import {
	ApplicationAction,
	TaskLogger,
} from "../../../../../shared/study/TaskLogger";
import { ViewController } from "../../../../../shared/ui/ViewController";
import { controlEventBus } from "../../../global/ControlEventBus";
import { NodeData, getNodeDatasFromCy } from "../../experiment/search/NodeData";
import { GraphViewEvents } from "../../graph/GraphView";
import {
	SharedEventBusEvent,
	sharedEventBus,
} from "../../shared/SharedEventBus";
import {
	ActionBarCategory,
	ActionBarView,
	ActionBarViewEvent,
} from "./ActionBarView";
import cytoscape from "cytoscape-select";

export enum ActionBarEvents {
	CLICK_SELECT_ALL = "TOGGLE_SELECT_ALL",
	CLICK_INVERT_SELECTION = "TOGGLE_INVERT_SELECTION",

	CLICK_SELECT_PATH = "TOGGLE_SELECT_PATH",
	CLICK_SELECT_NEIGHBORS = "TOGGLE_SELECT_NEIGHBORS",

	CLICK_SHOW_ALL_NODES = "TOGGLE_SHOW_ALL_NODES",
	CLICK_HIDE_SELECTED_NODES = "TOGGLE_HIDE_SELECTED_NODES",
	CLICK_HIDE_UNSELECTED_NODES = "TOGGLE_HIDE_UNSELECTED_NODES",
}

export class ActionBarController extends ViewController<ActionBarView> {
	private cy: cytoscape.Core;
	private fuzzySearchManager: FuzzySearchManager<NodeData> | null = null;

	private readonly tool = SelectionTool.SEARCH;
	private selectionType: SelectionType = SelectionType.NEW;

	private readonly actionBarConfig = [
		{
			category: ActionBarCategory.Modus,
			label: SELECTION_TYPE_LABEL_MAP[SelectionType.NEW],
			callback: () => {
				TaskLogger.logAction(ApplicationAction.TOGGLE_SELECTION_MODE, {
					type: SelectionType.NEW,
				});
				this.onSelectionTypeChange(SelectionType.NEW);
			},
		},
		{
			category: ActionBarCategory.Modus,
			label: SELECTION_TYPE_LABEL_MAP[SelectionType.ADD],
			callback: () => {
				TaskLogger.logAction(ApplicationAction.TOGGLE_SELECTION_MODE, {
					type: SelectionType.ADD,
				});
				this.onSelectionTypeChange(SelectionType.ADD);
			},
		},
		{
			category: ActionBarCategory.Modus,
			label: SELECTION_TYPE_LABEL_MAP[SelectionType.SUBTRACT],
			callback: () => {
				TaskLogger.logAction(ApplicationAction.TOGGLE_SELECTION_MODE, {
					type: SelectionType.SUBTRACT,
				});
				this.onSelectionTypeChange(SelectionType.SUBTRACT);
			},
		},

		{
			category: ActionBarCategory.Select,
			label: "Alles selektieren",
			callback: () => {
				// logged in GraphView
				this.emitEvent(ActionBarEvents.CLICK_SELECT_ALL);
			},
		},
		{
			category: ActionBarCategory.Select,
			label: "Selektion invertieren",
			callback: () => {
				// logged in GraphView
				this.emitEvent(ActionBarEvents.CLICK_INVERT_SELECTION);
			},
		},

		{
			category: ActionBarCategory.Select,
			label: "Pfad zwischen 2 Knoten selektieren",
			callback: () => {
				TaskLogger.logAction(ApplicationAction.USE_TOOL, {
					tool: SelectionTool.PATH,
				});
				this.emitEvent(ActionBarEvents.CLICK_SELECT_PATH);
			},
		},
		{
			category: ActionBarCategory.Select,
			label: "Nachbarn von Auswahl selektiern",
			callback: () => {
				TaskLogger.logAction(ApplicationAction.USE_TOOL, {
					tool: SelectionTool.NEIGHBORS,
				});
				this.emitEvent(ActionBarEvents.CLICK_SELECT_NEIGHBORS);
			},
		},
		{
			category: ActionBarCategory.VIEW,
			label: "Alle Knoten einblenden",
			callback: () => {
				TaskLogger.logAction(ApplicationAction.USE_FILTER, {
					action: "remove",
				});
				this.emitEvent(ActionBarEvents.CLICK_SHOW_ALL_NODES);
			},
		},
		{
			category: ActionBarCategory.VIEW,
			label: "Selektierte Knoten ausblenden",
			callback: () => {
				TaskLogger.logAction(ApplicationAction.USE_FILTER, {
					action: "add",
				});
				this.emitEvent(ActionBarEvents.CLICK_HIDE_SELECTED_NODES);
			},
		},
		{
			category: ActionBarCategory.VIEW,
			label: "Unselektierte Knoten ausblenden",
			callback: () => {
				TaskLogger.logAction(ApplicationAction.USE_FILTER, {
					action: "add",
				});
				this.emitEvent(ActionBarEvents.CLICK_HIDE_UNSELECTED_NODES);
			},
		},
	];

	constructor(cy: cytoscape.Core) {
		super(new ActionBarView());
		this.cy = cy;

		this.view.loadConfig(this.actionBarConfig);
		this.view.setSelectionType(
			this.selectionType,
			SELECTION_TYPE_LABEL_MAP[this.selectionType]
		);

		this.initEventListeners();
	}

	private initEventListeners = () => {
		sharedEventBus.on(
			SharedEventBusEvent.SELECTION_TYPE_CHANGED,
			this.setSelectionType
		);

		controlEventBus.addListener(
			GraphViewEvents.SELECTION_CHANGED,
			this.onGraphSelectionChanged
		);

		this.view.on(ActionBarViewEvent.TOGGLE_SEARCH, this.onToggleSearch);
		this.view.on(
			ActionBarViewEvent.SEARCH_INPUT_CHANGED,
			this.onSearchInputChanged
		);
		this.view.on(
			ActionBarViewEvent.CLICK_SEARCH_RESULT,
			this.onClickSearchResult
		);
	};

	private onClickSearchResult = (nodeId: string) => {
		controlEventBus.emit(
			ActionBarViewEvent.CLICK_SEARCH_RESULT,
			nodeId,
			this.view.getSearchInput(),
			this.view.getSearchKey()
		);
	};

	private onGraphSelectionChanged = (nodeIds: string[]) => {
		this.view.updateSelection(nodeIds);
	};

	private onSelectionTypeChange = (selectionType: SelectionType) => {
		sharedEventBus.emit(
			SharedEventBusEvent.SELECTION_TYPE_CHANGED,
			selectionType
		);
	};

	private setSelectionType = (selectionType: SelectionType) => {
		this.selectionType = selectionType;
		this.view.setSelectionType(
			selectionType,
			SELECTION_TYPE_LABEL_MAP[selectionType]
		);
	};

	private emitEvent = (event: ActionBarEvents, data?: any) => {
		controlEventBus.emit(event, data);
	};

	private onToggleSearch = (on: boolean) => {
		if (on) this.onOpenSearch();
		else this.onCloseSearch();
	};

	private onOpenSearch = () => {
		TaskLogger.logAction(ApplicationAction.USE_TOOL, {
			tool: SelectionTool.SEARCH,
			data: { action: "open" },
		});

		const nodeDatas = getNodeDatasFromCy(this.cy),
			keys = FuzzySearch.getKeys(nodeDatas[0] ?? {});

		this.view.setSearchKeyValues(keys);
		this.fuzzySearchManager = new FuzzySearchManager(nodeDatas);

		this.onSearchInputChanged(this.view.getSearchInput(), false);
		this.view.toggleSearch(true);
	};

	private onCloseSearch = () => {
		TaskLogger.logAction(ApplicationAction.USE_TOOL, {
			tool: SelectionTool.SEARCH,
			data: { action: "close" },
		});

		this.view.toggleSearch(false);
		this.fuzzySearchManager = null;
	};

	private onSearchInputChanged = (query: string, isUserTyping = true) => {
		if (query !== "" && isUserTyping)
			TaskLogger.logAction(ApplicationAction.USE_TOOL, {
				tool: SelectionTool.SEARCH,
				data: { action: "query", query },
			});

		const nodeDatas = getNodeDatasFromCy(this.cy),
			selectedIds = nodeDatas
				.map((n) => {
					const id = n.id,
						selected = this.cy.getElementById(id).selected();
					return selected ? id : null;
				})
				.filter((s) => s);

		const searchResults = this.fuzzySearchManager
			?.search(this.view.getSearchKey(), this.view.getSearchInput())
			.map((r) => r.item);

		if (searchResults) this.view.setSearchResults(searchResults, selectedIds);
	};

	toggleListeners(on = true) {}

	public reset(): void {
		this.view.reset();
	}
}
