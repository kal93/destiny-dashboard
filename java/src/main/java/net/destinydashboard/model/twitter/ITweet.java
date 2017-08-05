package net.destinydashboard.model.twitter;

import java.io.Serializable;
import java.util.Date;

public class ITweet implements Serializable
{
    public String id;
    public Date createdAt;
    public String text;
    public int favoriteCount;
    public int retweetCount;

    public ITweet() {

    }

    public ITweet(String id, Date createdAt, String text, int favoriteCount, int retweetCount) {
        this.id = id;
        this.createdAt = createdAt;
        this.text = text;
        this.favoriteCount = favoriteCount;
        this.retweetCount = retweetCount;
    }
}
