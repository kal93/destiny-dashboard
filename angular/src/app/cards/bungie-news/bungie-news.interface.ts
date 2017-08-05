export interface ITwitterReponse {
    imageUrl: string;
    tweets: Tweet[];
}

export interface Tweet {
    id: string;
    createdAt: string;
    text: string;
    favoriteCount: number;
    retweetCount: number;
}