import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutes } from './app.routes';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { NgbModule, NgbDateAdapter, NgbDateNativeAdapter, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { ErrorService } from './common/services/error.service';
import { NotFoundComponent } from './common/components/notfound.component';
import { AccessGuard } from './common/auth/auth.accessguard';
import { AuthoriseRequestInterceptor, UnauthorisedResponseInterceptor } from './common/auth/auth.interceptors';
import { SharedModule } from './shared.module';
import { JsonDateInterceptor } from './common/interceptors/jsondate.interceptor';
import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';

@NgModule({ declarations: [
        AppComponent,
        NotFoundComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
        RouterModule.forRoot(AppRoutes, {}),
        ToastrModule.forRoot({
            closeButton: true,
            positionClass: "toast-bottom-right",
            timeOut: 5000,
            extendedTimeOut: 5000,
            progressBar: true,
            preventDuplicates: true
        }),
        NgHttpLoaderModule.forRoot(),
        BrowserAnimationsModule,
        FormsModule,
        NgbModule,
        SharedModule], providers: [
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
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
