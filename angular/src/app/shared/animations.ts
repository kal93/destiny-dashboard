import { animate, keyframes, stagger, trigger, query, style, transition } from '@angular/animations';

export function routerTransition() {
    //Trigger when route is changed
    return trigger('routerTransition', [
        //Do transition when we are going from dashboard to anything else
        transition('dashboard => card', [
            query('div', [
                style({ transform: 'translateX(100%)' }),
                animate('500ms ease-out', style({ transform: 'translateX(0)' }))
            ])
        ]),
        transition('card => dashboard', [
            query('div', [
                style({ transform: 'translateX(-100%)' }),
                animate('500ms ease-in', style({ transform: 'translateX(0)' }))
            ])
        ])
    ]);
}

export function fadeInOut() {
    //Trigger when route is changed
    return trigger('fadeInOut', [
        transition(
            ':enter', [
                style({ opacity: 0 }),
                animate('300ms', style({ opacity: 1 }))
            ]
        ),
        transition(
            ':leave', [
                style({ opacity: 1 }),
                animate('300ms', style({ opacity: 0 }))
            ])
    ]);
}

export function fadeIn() {
    //Trigger when route is changed
    return trigger('fadeIn', [
        transition(
            ':enter', [
                style({ opacity: 0 }),
                animate('300ms', style({ opacity: 1 }))
            ]
        )
    ]);
}

export function bounceChildrenFromLeft(delayByMs: number = 0) {
    return trigger('bounceChildrenFromLeft', [
        transition('* => *', [
            query(':enter', style({ opacity: 0 }), { optional: true }),
            query(':enter', stagger('150ms', [
                animate('400ms ' + delayByMs + 'ms  ease-in', keyframes([
                    style({ opacity: 0, transform: 'translate(-100%)', offset: 0 }),
                    style({ opacity: .5, transform: 'translate(30px)', offset: 0.5 }),
                    style({ opacity: 1, transform: 'translateY(0)', offset: 1.0 }),
                ]))]), { optional: true })
        ])
    ]);
}

export function fadeInChildren() {
    return trigger('fadeInChildren', [
        transition('* => *', [
            query(':enter', style({ opacity: 0 }), { optional: true }),
            query(':enter', stagger('200ms', [
                animate('400ms ease-in', keyframes([
                    style({ opacity: 0, offset: 0 }),
                    style({ opacity: 1, offset: 1.0 }),
                ]))]), { optional: true })
        ])
    ]);
}

export function slideChildrenFromBottom() {
    return trigger('slideChildrenFromBottom', [
        transition('* => *', [
            query(':enter', style({ opacity: 0 }), { optional: true }),
            query(':enter', stagger('150ms', [
                animate('300ms ease-in', keyframes([
                    style({ opacity: 0, transform: 'translateY(100%)', offset: 0 }),
                    style({ opacity: .5, transform: 'translateY(-20px)', offset: .5 }),
                    style({ opacity: 1, transform: 'translateY(0)', offset: 1.0 }),
                ]))]), { optional: true })
        ])
    ]);
}

export function expandInShrinkOut() {
    return trigger('expandInShrinkOut', [
        transition(
            ':enter', [
                style({ opacity: .5, height: 0 }),
                animate('400ms ease-in', style({ opacity: 1, height: '*' }))
            ]
        ),
        transition(
            ':leave', [
                style({ opacity: 1, height: '*' }),
                animate('400ms ease-out', style({ opacity: .5, height: 0 }))
            ])
    ]);
}