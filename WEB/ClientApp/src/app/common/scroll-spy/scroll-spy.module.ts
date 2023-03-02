import { NgModule } from '@angular/core';
import { SpyTargetDirective } from './spy-target.directive';
import { SpyOnDirective } from './spy-on.directive';

@NgModule({
    declarations: [
        SpyTargetDirective,
        SpyOnDirective
    ],
    exports: [
        SpyTargetDirective,
        SpyOnDirective
    ]
})
export class ScrollSpyModule { }
