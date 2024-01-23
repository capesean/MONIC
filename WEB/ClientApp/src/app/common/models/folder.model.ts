import { SearchOptions, PagingHeaders } from './http.model';
import { FolderContent } from './foldercontent.model';
import { IHasFields } from './ihasfields.model';
import { FieldValue } from './fieldvalue.model';
import { OptionValue } from './optionvalue.model';

export class Folder implements IHasFields {
    folderId: string;
    name: string;
    description: string;
    parentFolderId: string;
    rootFolder: boolean;
    parentFolder: Folder;

    subfolders: Folder[];
    folderContents: FolderContent[];
    fieldValues: FieldValue[] = [];
    optionValues: OptionValue[] = [];

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
