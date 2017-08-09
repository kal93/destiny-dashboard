import { ICardDefinition } from './card-definition';

export interface IUserDashboard {
    id: number;
    name: string;
    cards: Array<ICard>;
}

export interface ICard {
    sequence: number;
    definitionId: number;
    layoutId: number;

    //Assigned on client side at runtime
    id: number;
    layout: { rows: number, cols: number };
    definition: ICardDefinition;
}