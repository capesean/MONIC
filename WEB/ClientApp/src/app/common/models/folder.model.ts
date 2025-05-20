import { SearchOptions, PagingHeaders } from './http.model';
import { FolderContent } from './foldercontent.model';
import { IHasFields } from './ihasfields.model';
import { ItemField } from './itemfield.model';
import { ItemOption } from './itemoption.model';

export class Folder implements IHasFields {
    folderId: string;
    name: string;
    description: string;
    parentFolderId: string;
    rootFolder: boolean;
    parentFolder: Folder;

    subfolders: Folder[];
    folderContents: FolderContent[];
    itemFields: ItemField[] = [];
    itemOptions: ItemOption[] = [];

    constructor() {
        this.folderId = "00000000-0000-0000-0000-000000000000";
        this.subfolders = [];
        this.folderContents = [];
    }
}

export class FolderSearchOptions extends SearchOptions {
    q: string;
    parentFolderId: string;
}

export class FolderSearchResponse {
    folders: Folder[] = [];
    headers: PagingHeaders;
}
