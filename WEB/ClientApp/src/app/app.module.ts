import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi, withJsonpSupport } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutes } from './app.routes';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { NgbModule, NgbDateAdapter, NgbDateNativeAdapter, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { ErrorService } from './common/services/error.service';
import { NotFoundComponent } from './common/components/notfound.component';
import { AccessGuard } from './common/auth/auth.accessguard';
import { AuthoriseRequestInterceptor, UnauthorisedResponseInterceptor } from './common/auth/auth.interceptors';
import { SharedModule } from './shared.module';
import { JsonDateInterceptor } from './common/interceptors/jsondate.interceptor';
import { NgHttpLoaderComponent, pendingRequestsInterceptor$ } from 'ng-http-loader';
import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';

@NgModule({
    declarations: [
        AppComponent,
        NotFoundComponent
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot(AppRoutes, { anchorScrolling: 'enabled' }),
        ToastrModule.forRoot({
            closeButton: true,
            positionClass: "toast-bottom-right",
            timeOut: 5000,
            extendedTimeOut: 5000,
            progressBar: true,
            preventDuplicates: true
        }),
        BrowserAnimationsModule,
        NgHttpLoaderComponent,
        FormsModule,
        NgbModule,
        SharedModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthoriseRequestInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: UnauthorisedResponseInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JsonDateInterceptor, multi: true },
        { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter },
        AccessGuard,
        ErrorService,
        NgbTooltipConfig,
        PercentPipe,
        DecimalPipe,
        CurrencyPipe,
        { provide: LOCALE_ID, useValue: 'en-ZA' },
        provideHttpClient(withInterceptorsFromDi(), withJsonpSupport(), withInterceptors([pendingRequestsInterceptor$]))
    ]
})
export class AppModule { }
