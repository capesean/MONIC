import { trigger, transition, style, animate, sequence } from '@angular/animations';

export const FadeThenShrink = trigger('FadeThenShrink', [
    transition(':enter', [
        style({ height: '0px', opacity: 0 }),
        animate('150ms ease-out', style({ height: '*' })),
        animate('100ms ease-out', style({ opacity: 1 })),
    ]),
    transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0 })),
        animate('150ms ease-in', style({ height: '0px', marginTop: '0px', paddingTop: '0px', marginBottom: '0px', paddingBottom: '0px' })),
    ]),
]);
