export interface ITwitchData {
    followers: number;
    previewImageUrl: string;
    streamTitle: string;
    streamUrl: string;
    streamer: string;
    viewers: number;
}

export interface ITwitchResponse {
    _total: number; //unused
    streams: ITwitchResponseStream[];
    _links: any;//unused
}

export interface ITwitchResponsePreview {
    small: string;
    medium: string;
    large: string;
    template: string;
}

export interface ITwitchResponseChannel {
    mature: boolean;
    partner: boolean;
    status: string;
    broadcaster_language: string;
    display_name: string;
    game: string;
    language: string;
    _id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
    delay?: any;
    logo: string;
    banner?: any;
    video_banner: string;
    background?: any;
    profile_banner: string;
    profile_banner_background_color?: any;
    url: string;
    views: number;
    followers: number;
    _links: any; //unused
}

export interface ITwitchResponseStream {
    _id: any;
    game: string;
    viewers: number;
    video_height: number;
    average_fps: number;
    delay: number;
    created_at: Date;
    is_playlist: boolean;
    stream_type: string;
    preview: ITwitchResponsePreview;
    channel: ITwitchResponseChannel;
    _links: any; //unused
}
