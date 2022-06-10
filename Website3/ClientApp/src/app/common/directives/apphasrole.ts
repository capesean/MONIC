import { Input, Directive, ViewContainerRef, TemplateRef, AfterContentInit, ChangeDetectorRef } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { ProfileService } from "../services/profile.service";

@Directive({
    selector: '[appHasRole]'
})
export class AppHasRoleDirective implements AfterContentInit {

    @Input('appHasRole')
    public role: string;

    constructor(
        private viewContainer: ViewContainerRef,
        private templateRef: TemplateRef<unknown>,
        private authService: AuthService,
        private profileService: ProfileService,
        private cd: ChangeDetectorRef
    ) {
    }

    ngAfterContentInit(): void {
        this.profileService.getProfile().subscribe(
            profile => {

                if (this.role && profile && this.authService.isInRole(profile, this.role)) {
                    this.viewContainer.createEmbeddedView(this.templateRef);
                } else {
                    this.viewContainer.clear();
                }
                this.cd.detectChanges();
            }
        );
    }
}
