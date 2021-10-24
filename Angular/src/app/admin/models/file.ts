export interface File {
	path: string;
	children?: File[];
	isDir?: boolean;
}
