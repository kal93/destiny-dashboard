export interface IBungieOAuth {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    refresh_expires_in: number;
    membership_id: string;
}