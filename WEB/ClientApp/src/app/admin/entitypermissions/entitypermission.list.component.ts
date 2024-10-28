import { Component as NgComponent, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { PagingHeaders } from '../../common/models/http.model';
import { EntityPermissionSearchOptions, EntityPermissionSearchResponse, EntityPermission } from '../../common/models/entitypermission.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { ErrorService } from '../../common/services/error.service';
import { EntityPermissionService } from '../../common/services/entitypermission.service';

@NgComponent({
    selector: 'entitypermission-list',
    templateUrl: './entitypermission.list.component.html',
    animations: [FadeThenShrink]
})
export class EntityPermissionListComponent implements OnInit {

    public entityPermissions: EntityPermission[] = [];
    public searchOptions = new EntityPermissionSearchOptions();
    public showSearchOptions = false;
    public headers = new PagingHeaders();

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private entityPermissionService: EntityPermissionService
    ) {
    }

    ngOnInit(): void {
        this.searchOptions.includeParents = true;
        this.runSearch();
    }

    runSearch(pageIndex = 0): Subject<EntityPermissionSearchResponse> {

        this.searchOptions.pageIndex = pageIndex;

        const subject = new Subject<EntityPermissionSearchResponse>();

        this.entityPermissionService.search(this.searchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.entityPermissions = response.entityPermissions;
                    this.headers = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Entity Permissions", "Load");
                }
            });

        return subject;

    }

    goToEntityPermission(entityPermission: EntityPermission): void {
        this.router.navigate(["/users", entityPermission.user.id, "entitypermissions", entityPermission.entityPermissionId]);
    }
}

