import { Input, Directive, ElementRef, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";
import { distinctUntilChanged, map, startWith, takeUntil } from "rxjs/operators";

@Directive({
    selector: '[appHasRole]',
    standalone: false
})
export class AppHasRoleDirective implements OnInit, OnDestroy {

    private role$ = new BehaviorSubject<string | string[] | null>(null);
    private destroy$ = new Subject<void>();

    @Input('appHasRole')
    set appHasRole(value: string | string[]) {
        this.role$.next(value);
    }

    constructor(
        private authService: AuthService,
        private elementRef: ElementRef<HTMLElement>
    ) {
    }

    ngOnInit() {
        this.updateElementVisibility(false);

        combineLatest([
            this.authService.roles$.pipe(startWith(this.authService.roles$.value)),
            this.role$
        ]).pipe(
            map(([roles, required]) => {
                if (!required) return false;
                return this.authService.isInRole(roles, required as any); // see note below
            }),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(isAllowed => this.updateElementVisibility(isAllowed));
    }

    private updateElementVisibility(isVisible: boolean) {
        this.elementRef.nativeElement.style.display = isVisible ? '' : 'none';
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
