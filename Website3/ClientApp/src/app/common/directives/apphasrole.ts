import { Input, Directive, ElementRef } from "@angular/core";
import { AuthService } from "../services/auth.service";

@Directive({
    selector: '[appHasRole]'
})
export class AppHasRoleDirective {

    @Input('appHasRole')
    public role: string;

    constructor(
        private authService: AuthService,
        private elementRef: ElementRef
    ) {
    }


    ngOnInit(): void {
        this.authService.getProfile().subscribe(
            profile => {
                this.elementRef.nativeElement.style.display = this.role && profile && this.authService.isInRole(profile, this.role) ? "block" : "none";
            }
        );
    }
}
