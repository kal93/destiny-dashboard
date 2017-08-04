package net.destinydashboard.model.twitter;

import java.io.Serializable;
import java.util.Date;

public class ITweet implements Serializable
{
    public Date createdAt;
    public String text;
    public int favoriteCount;
    public int retweetCount;

    public ITweet() {

    }

    public ITweet(Date createdAt, String text, int favoriteCount, int retweetCount) {
        this.createdAt = createdAt;
        this.text = text;
        this.favoriteCount = favoriteCount;
        this.retweetCount = retweetCount;
    }
}
