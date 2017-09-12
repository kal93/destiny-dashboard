import { animate, keyframes, stagger, trigger, query, style, transition } from '@angular/animations';

export function fadeInOut() {
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
    return trigger('fadeIn', [
        transition(
            ':enter', [
                style({ opacity: 0 }),
                animate('300ms', style({ opacity: 1 }))
            ]
        )
    ]);
}

export function slowFadeIn() {
    return trigger('slowFadeIn', [
        transition(
            ':enter', [
                style({ opacity: 0 }),
                animate('1500ms', style({ opacity: 1 }))
            ]
        )
    ]);
}

export function slideFromBottom() {
    return trigger('slideFromBottom', [
        transition(
            ':enter', [
                style({ transform: 'translateY(100%)' }),
                animate('300ms ease-out', style({ transform: 'translateY(0)' }))
            ]
        ),
        transition(
            ':leave', [
                style({ transform: 'translateY(0)' }),
                animate('300ms ease-in', style({ transform: 'translateY(100%)' }))
            ])
    ]);
}

export function fadeInFromTop() {
    return trigger('fadeInFromTop', [
        transition(
            ':enter', [
                style({ transform: 'translateY(-100%)', opacity: .1 }),
                animate('250ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
            ]
        ),
        transition(
            ':leave', [
                style({ transform: 'translateY(0)', opacity: 1 }),
                animate('250ms ease-in', style({ transform: 'translateY(-100%)', opacity: .1 }))
            ])
    ]);
}

export function bounceChildrenFromLeft(delayByMs: number = 0) {
    return trigger('bounceChildrenFromLeft', [
        transition('* => *', [
            query(':enter', style({ transform: 'translate(-100%)' }), { optional: true }),
            query(':enter', stagger('150ms', [
                animate('400ms ' + delayByMs + 'ms  ease-in', keyframes([
                    style({ transform: 'translate(-100%)', offset: 0 }),
                    style({ transform: 'translate(30px)', offset: 0.5 }),
                    style({ transform: 'translateY(0)', offset: 1.0 }),
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
            query(':enter', style({ transform: 'translateY(100%)' }), { optional: true }),
            query(':enter', stagger('150ms', [
                animate('300ms ease-in', keyframes([
                    style({ transform: 'translateY(100%)', offset: 0 }),
                    style({ transform: 'translateY(-20px)', offset: .5 }),
                    style({ transform: 'translateY(0)', offset: 1.0 }),
                ]))]), { optional: true })
        ])
    ]);
}

export function expandInShrinkOut() {
    return trigger('expandInShrinkOut', [
        transition(
            ':enter', [
                style({ height: 0 }),
                animate('300ms ease-in', style({ height: '*' }))
            ]
        ),
        transition(
            ':leave', [
                style({ height: '*' }),
                animate('300ms ease-out', style({ height: 0 }))
            ])
    ]);
}

export function scaleIn() {
    return trigger('scaleIn', [
        transition(
            ':enter', [
                style({ transform: 'scale(0)' }),
                animate('150ms cubic-bezier(0.0, 0.0, 0.2, 1)', style({ transform: 'scale(1)' }))
            ],
        )
    ]);
}
