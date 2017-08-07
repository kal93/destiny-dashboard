package net.destinydashboard.model.twitter;

import java.io.Serializable;

public class ITweet implements Serializable
{
    public String id;
    public long createdAgoMs;
    public String text;
    public int favoriteCount;
    public int retweetCount;

    public ITweet() {

    }

    public ITweet(String id, long createdAgoMs, String text, int favoriteCount, int retweetCount) {
        this.id = id;
        this.createdAgoMs = createdAgoMs;
        this.text = text;
        this.favoriteCount = favoriteCount;
        this.retweetCount = retweetCount;
    }
}
