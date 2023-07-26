/// <reference types="vite/client" />
declare module "wikibase-edit-browser";
declare const APP_VERSION: string;
/* // TEMPLATE
declare module 'cytoscape-layout-utilities' {
    const ext: cytoscape.Ext;
    export = ext;
} */

declare module "cytoscape-node-html-label";

// declare module cytoscape-seleect as any
declare module "cytoscape-select" {
	const cytoscape = cytoscape;
	export = cytoscape;
}
