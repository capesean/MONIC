import { Input, Directive, ElementRef, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Subscription } from "rxjs";

@Directive({
    selector: '[appHasRole]'
})
export class AppHasRoleDirective implements OnInit, OnDestroy {

    @Input('appHasRole') roleName: string;

    private subscription: Subscription = new Subscription();

    constructor(
        private authService: AuthService,
        private elementRef: ElementRef
    ) {
    }

    ngOnInit() {
        this.elementRef.nativeElement.style.display = 'none';
        this.checkRole();
    }

    private checkRole() {
        this.subscription = this.authService.isInRole$(this.roleName).subscribe(isAllowed => {
            this.updateElementVisibility(isAllowed);
        });
    }

    private updateElementVisibility(isVisible: boolean) {
        this.elementRef.nativeElement.style.display = isVisible ? '' : 'none';
    }

    ngOnDestroy() {
        if (this.subscription) this.subscription.unsubscribe();
    }
}
