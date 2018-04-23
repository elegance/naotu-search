export interface FileNode {
    file_guid: string;
    file_name: string;
    ext_name: string;
    parent_guid: string
    file_type: FileType;
    create_time: string;
    last_modified_time: string;
    size: number;
}

export enum FileType {
    DIRECTORY = "directory",
    FILE = "file"
}

export interface KmFile {
    data: KmFileNode;
    children?: Array<KmFileNode>;
}

export interface KmFileNode {
    id: string;
    created: number;
    text: string;
}