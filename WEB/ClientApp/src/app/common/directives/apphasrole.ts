import { Input, Directive, ElementRef, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { ReplaySubject, Subject, combineLatest } from "rxjs";
import { distinctUntilChanged, map, takeUntil } from "rxjs/operators";

@Directive({
    selector: "[appHasRole]",
    standalone: false
})
export class AppHasRoleDirective implements OnInit, OnDestroy {
    private required$ = new ReplaySubject<string | string[] | null>(null);
    private destroy$ = new Subject<void>();

    @Input("appHasRole")
    set appHasRole(value: string | string[]) {
        this.required$.next(value);
    }

    constructor(
        private auth: AuthService,
        private el: ElementRef<HTMLElement>
    ) { }

    ngOnInit() {
        // default hidden until proven allowed
        this.setVisible(false);

        combineLatest([
            this.auth.state$,
            this.required$
        ])
            .pipe(
                map(([_, required]) => required ? this.auth.isInRole(required) : false),
                distinctUntilChanged(),
                takeUntil(this.destroy$)
            )
            .subscribe(allowed => this.setVisible(allowed));
    }

    private setVisible(visible: boolean) {
        this.el.nativeElement.style.display = visible ? "" : "none";
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
