import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StrongPasswordValidatorDirective } from './strong-password.directive';
import { StrengthMeterComponent } from './strength-meter/strength-meter.component';
import { PasswordFeedbackComponent } from './password-feedback/password-feedback.component'

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        StrongPasswordValidatorDirective,
        StrengthMeterComponent,
        PasswordFeedbackComponent
    ],
    exports: [
        StrongPasswordValidatorDirective,
        StrengthMeterComponent,
        PasswordFeedbackComponent
    ]
})
export class StrongPasswordModule { }
