export interface ITwitterReponse {
    imageUrl: string;
    tweets: Tweet[];
}

export interface Tweet {
    id: string;
    createdAgoMs: number;
    text: string;
    favoriteCount: number;
    retweetCount: number;

    //Runtime variables
    createdAgoDate: Date;
}