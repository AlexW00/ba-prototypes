import { SelectionTool } from "../../../../../shared/study/SelectionTool";
import {
	SELECTION_TYPE_LABEL_MAP,
	SelectionType,
} from "../../../../../shared/study/SelectionType";
import {
	ApplicationAction,
	TaskLogger,
} from "../../../../../shared/study/TaskLogger";
import { View } from "../../../../../shared/ui/View";
import "./actionBar.css";
export enum ActionBarCategory {
	Modus = "Modus",
	Select = "Selektion",
	VIEW = "Ansicht",
}

interface ActionBarConfig {
	category: ActionBarCategory;
	label: string;
	callback: () => void;
}

export enum ActionBarViewEvent {
	TOGGLE_SEARCH = "TOGGLE_SEARCH",
	SEARCH_INPUT_CHANGED = "SEARCH_INPUT_CHANGED",
	CLICK_SEARCH_RESULT = "CLICK_SEARCH_RESULT",
}

export class ActionBarView extends View {
	private config: ActionBarConfig[] = [];

	private readonly $container: HTMLDivElement;
	private readonly $dropdownContainer: HTMLDivElement;
	private readonly $searchButton: HTMLDivElement;

	private readonly $searchInputContainer: HTMLDivElement;
	private readonly $searchInputPropertySelect: HTMLSelectElement;
	private readonly $searchInput: HTMLInputElement;
	private readonly $searchResults: HTMLDivElement;

	constructor() {
		super();
		this.$container = document.getElementById("action-bar") as HTMLDivElement;
		this.$dropdownContainer = document.getElementById(
			"action-bar-dropdowns"
		) as HTMLDivElement;
		this.$searchButton = document.getElementById(
			"action-bar-search-button"
		) as HTMLDivElement;
		this.$searchInputContainer = document.getElementById(
			"action-bar-search-input-container"
		) as HTMLDivElement;
		this.$searchInput = document.getElementById(
			"action-bar-search-input"
		) as HTMLInputElement;
		this.$searchInputPropertySelect = document.getElementById(
			"action-bar-search-property-select"
		) as HTMLSelectElement;
		this.$searchResults = document.getElementById(
			"action-bar-search-results"
		) as HTMLDivElement;
	}

	public loadConfig(config: ActionBarConfig[]) {
		this.config = config;
		this.createBar();
		this.collapseAll();
	}

	toggleHtmlListeners(on: boolean): void {
		if (on) {
			this.$container.addEventListener("click", this.onClickContainer);
			this.$searchButton.addEventListener("click", this.onClickSearchButton);
			this.$searchInput.addEventListener("input", this._onSearchInput);
			this.$searchResults.addEventListener("wheel", this.stopEvent);
			this.$searchInputPropertySelect.addEventListener(
				"change",
				this.onKeyChange
			);
		} else {
			this.$container.removeEventListener("click", this.onClickContainer);
			this.$searchButton.removeEventListener("click", this.onClickSearchButton);
			this.$searchInput.removeEventListener("input", this._onSearchInput);
			this.$searchResults.removeEventListener("wheel", this.stopEvent);
			this.$searchInputPropertySelect.removeEventListener(
				"change",
				this.onKeyChange
			);
		}
	}

	private _onSearchInput = () => {
		this.onSearchInput(true);
	};

	private onKeyChange = () => {
		TaskLogger.logAction(ApplicationAction.USE_TOOL, {
			tool: SelectionTool.SEARCH,
			data: {
				action: "key-change",
				key: this.getSearchKey(),
			},
		});
		this.onSearchInput(false);
	};

	private $createSearchResultItem = (result: any, isSelected: boolean) => {
		const $itemContainer = document.createElement("div");
		$itemContainer.classList.add("action-bar-search-result-item");
		if (isSelected) $itemContainer.classList.add("selected");
		const $itemLabel = $itemContainer.appendChild(
			document.createElement("div")
		);
		$itemLabel.classList.add("action-bar-search-result-item-label");
		$itemLabel.innerText = result.label;
		const $itemProperty = $itemContainer.appendChild(
			document.createElement("div")
		);
		$itemProperty.classList.add("action-bar-search-result-item-property");
		const propertyValue = result[this.getSearchKey()];
		$itemProperty.innerText = propertyValue;

		$itemContainer.dataset.id = result.id;
		return $itemContainer;
	};

	public updateSelection(selectedIds: string[]) {
		this.$searchResults.childNodes.forEach(($item: any) => {
			const id = $item.dataset.id;
			if (selectedIds.includes(id)) {
				$item.classList.add("selected");
			} else {
				$item.classList.remove("selected");
			}
		});
	}

	public setSearchResults = (searchResult: any[], selectedIds: string[]) => {
		this.$searchResults.innerHTML = "";
		if (searchResult.length === 0) {
			this.$searchResults.classList.add("hidden");
		} else {
			this.$searchResults.classList.remove("hidden");

			searchResult.forEach((result) => {
				const isSelected = selectedIds.includes(result.id);
				const $item = this.$createSearchResultItem(result, isSelected);

				$item.addEventListener("click", () =>
					this.onClickSearchResultItem(result, isSelected)
				);
				this.$searchResults.appendChild($item);
			});
		}
	};

	private onClickSearchResultItem = (item: any, isSelected: boolean) => {
		TaskLogger.logAction(ApplicationAction.USE_TOOL, {
			tool: SelectionTool.SEARCH,
			data: {
				action: "click-result",
			},
		});
		this.emit(ActionBarViewEvent.CLICK_SEARCH_RESULT, item.id);
	};

	public getSearchKey(): string {
		return this.$searchInputPropertySelect.value;
	}

	private onSearchInput = (isUserTyping = true) => {
		this.emit(
			ActionBarViewEvent.SEARCH_INPUT_CHANGED,
			this.getSearchInput(),
			isUserTyping
		);
	};

	public getSearchInput(): string {
		return this.$searchInput.value;
	}

	private onClickSearchButton = () => {
		this.$searchButton.classList.toggle("active");
		const isActive = this.$searchButton.classList.contains("active");
		this.emit(ActionBarViewEvent.TOGGLE_SEARCH, isActive);
	};

	toggleSearch(on: boolean) {
		this.$searchInputContainer.classList.toggle("hidden", !on);
		if (on) this.$searchInput.focus();
		else this.resetSearch();
	}

	private onClickContainer = (e: MouseEvent) => {
		e.stopPropagation();
	};

	private createBar() {
		// Group actions by category
		const categories: { [key in ActionBarCategory]?: ActionBarConfig[] } =
			this.config.reduce((acc, actionConfig) => {
				if (!acc[actionConfig.category]) {
					acc[actionConfig.category] = [];
				}
				acc[actionConfig.category]!.push(actionConfig);
				return acc;
			}, {} as { [key in ActionBarCategory]?: ActionBarConfig[] });

		for (const category in categories) {
			// @ts-ignore
			const dropdown = this.createDropdown(category, categories[category]);
			dropdown.className = "dropdown";
			this.$dropdownContainer.appendChild(dropdown);
		}
	}

	public setSearchKeyValues(keyValues: string[]) {
		this.$searchInputPropertySelect.innerHTML = "";
		for (const key of keyValues) {
			const option = document.createElement("option");
			option.value = key;
			option.innerText = key;
			this.$searchInputPropertySelect.appendChild(option);
		}

		// auto select "label" if available
		const labelOption: HTMLOptionElement | null =
			this.$searchInputPropertySelect.querySelector('option[value="label"]');
		if (labelOption) labelOption.selected = true;
	}

	private createDropdown(category: string, actions: ActionBarConfig[]) {
		const dropdownContainer = document.createElement("div");
		dropdownContainer.className = "dropdown-container";
		const btn = document.createElement("div");
		btn.className = "dropdown-btn";

		btn.innerText = category;
		dropdownContainer.appendChild(btn);

		const dropdownContent = document.createElement("div");
		dropdownContent.className = "dropdown-content";

		for (const action of actions) {
			const actionElement = document.createElement("div");
			actionElement.className = "action-btn";
			actionElement.innerText = action.label;
			actionElement.setAttribute("data-label", action.label);
			actionElement.addEventListener("click", () => {
				this.collapseAll();
				action.callback();
			});
			dropdownContent.appendChild(actionElement);
		}

		btn.addEventListener("click", () => {
			const isCollapsed = dropdownContent.style.display === "none";
			this.collapseAll();
			dropdownContent.style.display = isCollapsed ? "flex" : "none";
			dropdownContainer.classList.toggle("active", isCollapsed);
		});

		dropdownContainer.appendChild(dropdownContent);

		return dropdownContainer;
	}

	public setSelectionType(type: SelectionType, label: string) {
		const selectionTypeBtn = this.$dropdownContainer.querySelector(
			`.action-btn[data-label="${label}"]`
		) as HTMLDivElement;

		const allBtns = this.$dropdownContainer.querySelectorAll(".action-btn");
		for (const btn of allBtns as any) {
			btn.classList.remove("active");
		}

		selectionTypeBtn.classList.add("active");
	}

	collapseAll() {
		const dropdowns =
			this.$dropdownContainer.getElementsByClassName("dropdown-content");
		for (const dropdown of dropdowns as any) {
			dropdown.style.display = "none";
			dropdown.parentElement.classList.remove("active");
		}
	}

	private resetSearch() {
		this.$searchResults.innerHTML = "";
		this.$searchResults.classList.add("hidden");
		this.$searchInput.value = "";
	}

	public reset() {
		this.resetSearch();
		this.$searchInputPropertySelect.value = "label";
		this.setSelectionType(
			SelectionType.NEW,
			SELECTION_TYPE_LABEL_MAP[SelectionType.NEW]
		);
		this.collapseAll();
		this.toggleSearch(false);
		this.$searchButton.classList.toggle("active", false);
	}
}
