import { SearchOptions, PagingHeaders } from './http.model';
import { Folder } from './folder.model';
import { User } from './user.model';

export class FolderContent {
    folderContentId: string;
    folderId: string;
    name: string;
    html: string;
    addedOn: Date;
    addedById: string;
    folder: Folder;
    addedBy: User;

    constructor() {
        this.folderContentId = "00000000-0000-0000-0000-000000000000";
    }
}

export class FolderContentSearchOptions extends SearchOptions {
    q: string;
    folderId: string;
    addedById: string;
}

export class FolderContentSearchResponse {
    folderContents: FolderContent[] = [];
    headers: PagingHeaders;
}
