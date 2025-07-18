import { ChangeDetectorRef, Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { BreadcrumbService } from '../../common/services/breadcrumb.service';
import { ErrorService } from '../../common/services/error.service';
import { Indicator, IndicatorSearchOptions, IndicatorSearchResponse } from '../../common/models/indicator.model';
import { Token, TokenSearchOptions } from '../../common/models/token.model';
import { IndicatorService } from '../../common/services/indicator.service';
import { Enum, Enums, OperatorTypes, TokenTypes, ParenthesisTypes, IndicatorStatuses, IndicatorTypes, ItemTypes, AggregationTypes, } from '../../common/models/enums.model';
import { FadeThenShrink } from '../../common/animations/fadethenshrink';
import { TokenService } from '../../common/services/token.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { IndicatorModalComponent } from './indicator.modal.component';
import { ConfirmModalComponent, ConfirmModalOptions } from '../../common/components/confirm.component';
import { ItemComponent } from '../../common/components/item.component';
import { AppService } from '../../common/services/app.service';
import { DocumentService } from '../../common/services/document.service';
import { Item } from '../../common/models/item.model';
import { AppSettings } from '../../common/models/appsettings.model';
import { SubcategoryService } from '../../common/services/subcategory.service';
import { PagingHeaders } from '../../common/models/http.model';
import { Subject } from 'rxjs';
import { IndicatorDate, IndicatorDateSearchOptions, IndicatorDateSearchResponse } from '../../common/models/indicatordate.model';
import { IndicatorDateService } from '../../common/services/indicatordate.service';
import { AppDate } from '../../common/models/date.model';
import { DateModalComponent } from '../dates/date.modal.component';

@Component({
    selector: 'indicator-edit',
    templateUrl: './indicator.edit.component.html',
    styleUrls: ['./indicator.edit.css'],
    animations: [FadeThenShrink],
    standalone: false
})
export class IndicatorEditComponent extends ItemComponent implements OnInit {

    public indicator: Indicator = new Indicator();
    public isNew = true;
    public indicatorStatuses: Enum[] = Enums.IndicatorStatuses;
    public dateTypes: Enum[] = Enums.DateTypes;
    public indicatorTypes: Enum[] = Enums.IndicatorTypes;
    public dataTypes: Enum[] = Enums.DataTypes;
    public tokenTypes: Enum[] = Enums.TokenTypes;
    public tokenTypesOperator: TokenTypes = TokenTypes.Operator;
    public tokenTypesIndicator: TokenTypes = TokenTypes.Indicator;
    public tokenTypesNumber: TokenTypes = TokenTypes.Number;
    public tokenTypesParenthesis: TokenTypes = TokenTypes.Parenthesis;
    public operatorTypes: Enum[] = Enums.OperatorTypes;
    public operatorTypesAdd: OperatorTypes = OperatorTypes.Add;
    public operatorTypesSubtract: OperatorTypes = OperatorTypes.Subtract;
    public operatorTypesDivide: OperatorTypes = OperatorTypes.Divide;
    public operatorTypesMultiply: OperatorTypes = OperatorTypes.Multiply;
    public indicatorTypesCalculated: IndicatorTypes = IndicatorTypes.Calculated;
    public indicatorTypesCollected: Enum = Enums.IndicatorTypes[IndicatorTypes.Collected];
    public parenthesisTypes: Enum[] = Enums.ParenthesisTypes;
    public parenthesisTypesOpen: ParenthesisTypes = ParenthesisTypes.Open;
    public parenthesisTypesClose: ParenthesisTypes = ParenthesisTypes.Close;
    public aggregationTypes: Enum[] = Enums.AggregationTypes;
    public activeToken: number;
    public tokens: LocalToken[] = [];
    private helpModal: NgbModalRef;
    public appSettings: AppSettings;

    public groupIndicatorsSearchOptions = new IndicatorSearchOptions();
    public groupIndicatorsHeaders = new PagingHeaders();
    public groupIndicators: Indicator[] = [];
    public showGroupIndicatorsSearch = false;

    public indicatorDatesSearchOptions = new IndicatorDateSearchOptions();
    public indicatorDatesHeaders = new PagingHeaders();
    public indicatorDates: IndicatorDate[] = [];
    public showIndicatorDatesSearch = false;

    @ViewChild('helpModal') helpContent: TemplateRef<any>;
    @ViewChild('indicatorModal') indicatorModal: IndicatorModalComponent;
    @ViewChild('groupIndicatorModal') groupIndicatorModal: IndicatorModalComponent;
    @ViewChild('dateModal') dateModal: DateModalComponent;

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private toastr: ToastrService,
        private breadcrumbService: BreadcrumbService,
        private indicatorService: IndicatorService,
        private tokenService: TokenService,
        protected modalService: NgbModal,
        protected errorService: ErrorService,
        protected cdref: ChangeDetectorRef,
        protected appService: AppService,
        protected documentService: DocumentService,
        private subcategoryService: SubcategoryService,
        private indicatorDateService: IndicatorDateService
    ) {
        super(appService, errorService, cdref, documentService, modalService);
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {

            let indicatorId = params["indicatorId"];
            this.isNew = indicatorId === "add";

            if (!this.isNew) {

                this.indicator.indicatorId = indicatorId;
                this.loadIndicator();

                this.groupIndicatorsSearchOptions.groupingIndicatorId = this.indicator.indicatorId;
                this.groupIndicatorsSearchOptions.includeParents = true;
                this.searchGroupIndicators();

                this.indicatorDatesSearchOptions.indicatorId = indicatorId;
                this.indicatorDatesSearchOptions.includeParents = true;
                this.searchIndicatorDates();

            }
            else {
                this.indicator.indicatorStatus = IndicatorStatuses.Enabled;
                this.setItem(this.indicator, { itemType: ItemTypes.Indicator, itemId: this.indicator.indicatorId } as Item);
                if (this.route.snapshot.queryParams["subcategoryId"] !== undefined) {
                    this.subcategoryService.get(this.route.snapshot.queryParams["subcategoryId"])
                        .subscribe(subcategory => {
                            this.indicator.subcategoryId = subcategory.subcategoryId;
                            this.indicator.subcategory = subcategory;
                        });
                }
            }

        });

        this.appService.getAppSettings().subscribe(appSettings => this.appSettings = appSettings);

    }

    private loadIndicator() {

        this.indicatorService.get(this.indicator.indicatorId)
            .subscribe({
                next: indicator => {
                    this.indicator = indicator;
                    this.changeBreadcrumb();
                    this.setItem(this.indicator, { itemType: ItemTypes.Indicator, itemId: this.indicator.indicatorId } as Item);
                    this.searchDocuments();
                },
                error: err => {
                    this.errorService.handleError(err, "Indicator", "Load");
                    if (err instanceof HttpErrorResponse && err.status === 404)
                        this.router.navigate(["../../"], { relativeTo: this.route });
                }
            });

        var tokenSearchOptions = new TokenSearchOptions();
        tokenSearchOptions.pageSize = 0;
        tokenSearchOptions.includeParents = true;
        tokenSearchOptions.indicatorId = this.indicator.indicatorId;

        this.tokenService.search(tokenSearchOptions)
            .subscribe({
                next: response => {
                    this.setTokens(response.tokens);
                },
                error: err => {
                    this.toastr.error("Failed to load the tokens.", "Error", err);
                    this.router.navigate(["../../"], { relativeTo: this.route });
                }
            });

    }

    private setTokens(tokens: Token[]): void {
        this.tokens = [];
        tokens.forEach(token => {
            if (token.tokenType === TokenTypes.Number) {
                var t = <LocalToken>token;
                t.numberAsText = t.number.toString();
                this.tokens.push(t);
            } else {
                this.tokens.push(token as LocalToken);
            }
        });
    }

    save(form: NgForm): void {

        this.updateValueAndValidity(form);

        if (form.invalid) {

            this.toastr.error("The form has not been completed correctly.", "Form Error");
            return;

        }

        if (this.indicator.indicatorType == IndicatorTypes.Calculated && !this.tokens.length) {

            this.toastr.error("The formula has not been completed.", "Form Error");
            return;

        }

        this.getData(this.indicator);

        this.indicatorService.save(this.indicator)
            .subscribe({
                next: indicator => {

                    // todo: save indicator & formula in one api call
                    if (this.isNew) this.indicator.indicatorId = indicator.indicatorId;
                    else {
                        this.setItem(this.indicator, { itemType: ItemTypes.Indicator, itemId: this.indicator.indicatorId } as Item);
                    }
                    this.indicator = indicator;
                    this.saveFormula();

                },
                error: err => {
                    this.errorService.handleError(err, "Indicator", "Save");
                }
            });

    }

    delete(): void {

        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = { title: "Delete Indicator", text: "Are you sure you want to delete this indicator?", deleteStyle: true, ok: "Delete" } as ConfirmModalOptions;
        modalRef.result.then(
            () => {

                this.indicatorService.delete(this.indicator.indicatorId)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The indicator has been deleted", "Delete Indicator");
                            this.router.navigate(["../"], { relativeTo: this.route });
                        },
                        error: err => {
                            this.errorService.handleError(err, "Indicator", "Delete");
                        }
                    });

            }, () => { });


    }

    saveFormula(): void {

        // if new, need to set the indicatorid
        this.tokens.forEach(token => {
            token.indicatorId = this.indicator.indicatorId;
        });

        this.indicatorService.saveFormula(this.indicator.indicatorId, this.tokens)
            .subscribe({
                next: tokens => {

                    if (this.isNew) {
                        this.router.navigate(["../", this.indicator.indicatorId], { relativeTo: this.route });
                    } else {
                        this.setTokens(tokens);
                    }

                    this.toastr.success("The indicator has been saved.", "Saved");

                },
                error: err => {
                    this.errorService.handleError(err, "Formula", "Save");
                }
            });

    }

    calculate() {

        this.indicatorService.calculate(this.indicator.indicatorId)
            .subscribe({
                next: () => {

                    this.toastr.success("The calculations have been run.", "Calculate");

                },
                error: err => {

                    this.errorService.handleError(err, "Calculations", "Run");

                }
            });

    }

    keyDown($event: KeyboardEvent): void {
        if ($event.code === "Backspace")
            $event.preventDefault();
    }

    key($event: KeyboardEvent): void {

        switch ($event.key) {
            case "ArrowLeft":
                if (this.activeToken >= 0) this.activeToken--;
                break;
            case "ArrowRight":
                if (this.activeToken < this.tokens.length - 1) this.activeToken++;
                break;
            case "Delete":
                this.remove(this.activeToken + 1);
                break;
            case "Backspace":
                const token = this.tokens[this.activeToken];
                if (token) {
                    if (token.tokenType === TokenTypes.Number) {
                        let numberAsText = token.numberAsText;
                        if (numberAsText.length > 1) {
                            numberAsText = numberAsText.substring(0, numberAsText.length - 1);
                            token.numberAsText = numberAsText;
                            token.number = +numberAsText;
                        } else {
                            if (this.remove(this.activeToken)) this.activeToken--;
                        }
                    } else {
                        if (this.remove(this.activeToken)) this.activeToken--;
                    }
                }
                break;
            case "+": case "-": case "/": case "*":
                this.operator($event.key);
                break;
            case "(": case ")":
                this.parenthesis($event.key);
                break;
            case "i": case "I":
                this.showIndicatorModal();
                break;
            case "0": case "1": case "2": case "3": case "4": case "5": case "6": case "7": case "8": case "9": case ".":
                this.num($event.key);
                break;
            case "Enter":
                this.saveFormula();
                break;
            case "Home":
                this.activeToken = -1;
                $event.stopPropagation();
                $event.preventDefault();
                break;
            case "End":
                this.activeToken = this.tokens.length > 0 ? this.tokens.length - 1 : -1;
                $event.preventDefault();
                $event.stopPropagation();
                break;
        }
    }

    formulaClick() { if (this.activeToken === undefined) this.activeToken = this.tokens.length - 1; }

    selectToken($index: number, $event: MouseEvent) { this.activeToken = $index; $event.stopPropagation(); }

    operator(opKey: string): void {
        let op: OperatorTypes;
        if (opKey === "+") op = OperatorTypes.Add;
        else if (opKey === "-") op = OperatorTypes.Subtract;
        else if (opKey === "*") op = OperatorTypes.Multiply;
        else if (opKey === "/") op = OperatorTypes.Divide;
        else throw "Invalid operator";

        var token = this.tokens[this.activeToken];
        if (token && token.tokenType === TokenTypes.Operator) {
            token.operatorType = op;
        } else {
            token = this.newOperatorToken(op);
            this.addToken(this.activeToken + 1, token);
            this.activeToken++;
        }
    }

    newOperatorToken(operatorType: OperatorTypes): LocalToken {
        var token = this.newToken();
        token.tokenType = TokenTypes.Operator;
        token.operatorType = operatorType;
        return token;
    }

    newParenthesisToken(parenthesisType: ParenthesisTypes): LocalToken {
        var token = this.newToken();
        token.tokenType = TokenTypes.Parenthesis;
        token.parenthesisType = parenthesisType;
        return token;
    }

    newNumberToken(number: number): LocalToken {
        var token = this.newToken();
        token.tokenType = TokenTypes.Number;
        token.number = number;
        token.numberAsText = number.toString();
        token.tokenNumber
        return token;
    }

    newIndicatorToken(indicator: Indicator): LocalToken {
        var token = this.newToken();
        token.tokenType = TokenTypes.Indicator;
        token.sourceIndicator = indicator;
        token.sourceIndicatorId = indicator.indicatorId;
        token.convertNullToZero = false;
        return token;
    }

    newToken(): LocalToken {
        var token = new LocalToken();
        token.indicatorId = this.indicator.indicatorId;
        return token;
    }

    parenthesis(paren: string): void {
        var token: LocalToken;

        if (paren === "(") token = this.newParenthesisToken(ParenthesisTypes.Open);
        else if (paren === ")") token = this.newParenthesisToken(ParenthesisTypes.Close);

        this.addToken(this.activeToken + 1, token);
        this.activeToken++;
    }

    addToken(index: number, token: LocalToken): void {
        this.tokens.splice(index, 0, token);
    }

    remove(index: number): boolean {
        if (this.tokens[index] !== undefined) {
            this.tokens.splice(index, 1);
            return true;
        }
        return false;
    }

    num(n: string): void {
        var token = this.tokens[this.activeToken];
        if (token && token.tokenType === TokenTypes.Number) {
            // existing number token
            if (n === ".") {
                // adding a decimal
                if (token.numberAsText.indexOf(".") >= 0) {
                    // already a decimal, do nothing
                    return;
                } else {
                    // add the decimal
                    token.numberAsText += ".";
                }
            } else {
                // adding a non-decimal
                token.numberAsText = token.numberAsText + n;
                token.number = +(token.numberAsText);
                if (Number.isNaN(token.number)) {
                    token.number = 0;
                    token.numberAsText = "0";
                }
            }
        } else {
            // new number token
            if (n === ".") {
                // init as a decimal
                token = this.newNumberToken(0);
                token.numberAsText = "0.";
            } else {
                // init as the number
                token = this.newNumberToken(+n);
            }
            this.addToken(this.activeToken + 1, token);
            this.activeToken++;
        }
    }

    showIndicatorModal(): void {

        this.indicatorModal.open();

    }

    changeIndicator(indicator: Indicator) {

        if (!indicator) return;
        var token = this.newIndicatorToken(indicator);
        this.addToken(this.activeToken + 1, token);
        this.activeToken++;

    }

    changeBreadcrumb(): void {
        this.breadcrumbService.changeBreadcrumb(this.route.snapshot, this.indicator.name != undefined ? this.indicator.name.substring(0, 25) : "(new indicator)");
    }

    showHelp(): void {
        this.helpModal = this.modalService.open(this.helpContent, { size: 'xl', centered: true, scrollable: true });
    }

    closeHelpModal(): void {
        this.helpModal.dismiss();
    }

    searchGroupIndicators(pageIndex = 0): Subject<IndicatorSearchResponse> {

        this.groupIndicatorsSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<IndicatorSearchResponse>()

        this.indicatorService.search(this.groupIndicatorsSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.groupIndicators = response.indicators;
                    this.groupIndicatorsHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Group Indicators", "Load");
                }
            });

        return subject;

    }

    addGroupIndicator() {
        this.groupIndicatorModal.open()
            .result.then(indicator => {
                if (indicator.indicatorId === this.indicator.indicatorId) {
                    this.toastr.error("Indicators cannot be grouped into themselves");
                    return;
                }
                if (indicator.indicatorType === IndicatorTypes.Group) {
                    this.toastr.error("Grouped indicators cannot be added to other indicator groups");
                    return;
                }
                if (indicator.groupingIndicatorId && indicator.groupingIndicatorId !== this.indicator.indicatorId) {
                    this.toastr.error("This indicator is already a member of another group");
                    return;
                }
                if (indicator.frequency != this.indicator.frequency) {
                    this.toastr.error("Grouping indicator frequency must match the group indicator frequency");
                    return;
                }

                indicator.groupingIndicatorId = this.indicator.indicatorId;
                this.indicatorService.save(indicator)
                    .subscribe({
                        next: () => {
                            this.toastr.success("The indicator has been added to the group.", "Group Indicator");
                            this.searchGroupIndicators();
                        },
                        error: err => this.errorService.handleError(err, "Group Indicator", "Add")
                    });
            });
    }

    removeGroupedIndicator(indicator: Indicator) {
        let modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
        (modalRef.componentInstance as ConfirmModalComponent).options = {
            title: "Remove Grouped Indicator",
            text: `Are you sure you want to remove the indicator <strong>${indicator.name}</strong> from this group?`,
            deleteStyle: true,
            ok: "Remove"
        } as ConfirmModalOptions;
        modalRef.result.then(() => {
            indicator.groupingIndicatorId = undefined;
            this.indicatorService.save(indicator)
                .subscribe({
                    next: () => {
                        this.toastr.success("The grouped indicator has been removed.", "Remove Grouped Indicator");
                        this.searchGroupIndicators();
                    },
                    error: err => this.errorService.handleError(err, "Grouped Indicator", "Remove")
                });
        }, () => { });

    }

    searchIndicatorDates(pageIndex = 0): Subject<IndicatorDateSearchResponse> {

        this.indicatorDatesSearchOptions.pageIndex = pageIndex;

        const subject = new Subject<IndicatorDateSearchResponse>()

        this.indicatorDateService.search(this.indicatorDatesSearchOptions)
            .subscribe({
                next: response => {
                    subject.next(response);
                    this.indicatorDates = response.indicatorDates;
                    this.indicatorDatesHeaders = response.headers;
                },
                error: err => {
                    this.errorService.handleError(err, "Indicator Dates", "Load");
                }
            });

        return subject;

    }

    goToIndicatorDate(indicatorDate: IndicatorDate): void {
        this.router.navigate(["indicatordates", indicatorDate.dateId], { relativeTo: this.route });
    }

    addIndicatorDates(): void {
        this.dateModal.open();
    }

    changeDate(dates: AppDate[]): void {
        if (!dates.length) return;
        const dateIdList = dates.map(o => o.dateId);
        this.indicatorService.saveIndicatorDates(this.indicator.indicatorId, dateIdList)
            .subscribe({
                next: () => {
                    this.toastr.success("The indicator dates have been saved", "Save Indicator Dates");
                    this.searchIndicatorDates(this.indicatorDatesHeaders.pageIndex);
                },
                error: err => {
                    this.errorService.handleError(err, "Indicator Dates", "Save");
                }
            });
    }

}

class LocalToken extends Token {
    numberAsText: string;
}
