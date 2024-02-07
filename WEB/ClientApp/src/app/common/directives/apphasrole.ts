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
        this.authService.getProfile().subscribe(
            profile => {
                if (typeof this.role === 'string')
                    this.elementRef.nativeElement.style.display = this.role && profile && this.authService.isInRole(profile, this.role) ? undefined : "none";
                else {
                    let hasARole = false;
                    (this.role as string[]).forEach(role => {
                        if (this.role && profile && this.authService.isInRole(profile, role)) {
                            hasARole = true;
                        }
                    });
                    this.elementRef.nativeElement.style.display = hasARole ? undefined : "none";
                }
            }
        );
    }
}
