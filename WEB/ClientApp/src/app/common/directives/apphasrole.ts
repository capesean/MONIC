import { Input, Directive, ElementRef } from "@angular/core";
import { AuthService } from "../services/auth.service";

@Directive({
    selector: '[appHasRole]'
})
export class AppHasRoleDirective {

    @Input('appHasRole')
    public role: string | string[];

    constructor(
        private authService: AuthService,
        private elementRef: ElementRef
    ) {
    }


    ngOnInit(): void {

        // todo: isinrole should be an observable - so caller (eg appHasRole) doesn't need to subscribe to getprofile
        this.authService.getProfile().subscribe(
            profile => {
                if (typeof this.role === 'string')
                    this.elementRef.nativeElement.style.display = this.role && profile && this.authService.isInRole(this.role) ? "block" : "none";
                else {
                    let hasARole = false;
                    (this.role as string[]).forEach(role => {
                        if (this.role && profile && this.authService.isInRole(role)) {
                            hasARole = true;
                        }
                    });
                    this.elementRef.nativeElement.style.display = hasARole ? "block" : "none";
                }
            }
        );
    }
}
