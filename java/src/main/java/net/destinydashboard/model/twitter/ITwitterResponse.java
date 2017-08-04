package net.destinydashboard.model.twitter;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class ITwitterResponse implements Serializable
{
    public String imageUrl;
    public List<ITweet> tweets = new ArrayList<ITweet>();

    public ITwitterResponse() {

    }

    public ITwitterResponse(String imageUrl, List<ITweet> tweets) {
        this.imageUrl = imageUrl;
        this.tweets = tweets;
    }
}
