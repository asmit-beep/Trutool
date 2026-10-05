// Shared response types only: never import the full catalogue into a search UI.
export type DirectoryTool={slug:string;name:string;category:string;categoryLabel:string;summary:string;format:string;initial:string};
export type CategoryOption={slug:string;short:string};
export type ToolResults={items:DirectoryTool[];total:number;page:number;pages:number;limit:number;query:string;category:string;sort:string};
