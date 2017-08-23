export interface ISubNavItem {
    title: string;
    materialIcon: string;
    selectedStyle?: boolean;
    selectedCallback?(ISubNavItem): void;
}

export interface IToolbarItem {
    title: string;
    materialIcon: string;
    selectedCallback?(IToolbarItem): void;
}