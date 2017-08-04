package net.destinydashboard.repository.twitter;

import java.util.List;

import com.google.appengine.api.memcache.Expiration;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;

import net.destinydashboard.model.twitter.ITweet;
import net.destinydashboard.model.twitter.ITwitterResponse;
import twitter4j.Paging;
import twitter4j.Status;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.conf.ConfigurationBuilder;

public class TwitterRepository
{
    private static MemcacheService memCache = MemcacheServiceFactory.getMemcacheService();

    public static ITwitterResponse getBungieTwitter() throws TwitterException {
        ITwitterResponse twitterResponse = (ITwitterResponse) memCache.get("twitter-bungie");
        if (twitterResponse != null)
            return twitterResponse;

        String TWITTER_CONSUMER_KEY = "ta17zpvCoynaqFDMRaGlQXMiU";
        String TWITTER_SECRET_KEY = System.getProperty("twitter-secret-key");
        String TWITTER_ACCESS_TOKEN = "875723640519708672-gOo9R5ni0r3q7lsvgGmenvAk3303rVk";
        String TWITTER_ACCESS_TOKEN_SECRET = System.getProperty("twitter-secret-token");

        ConfigurationBuilder cb = new ConfigurationBuilder();
        cb.setDebugEnabled(true).setOAuthConsumerKey(TWITTER_CONSUMER_KEY).setOAuthConsumerSecret(TWITTER_SECRET_KEY)
                .setOAuthAccessToken(TWITTER_ACCESS_TOKEN).setOAuthAccessTokenSecret(TWITTER_ACCESS_TOKEN_SECRET);

        Twitter twitter = new TwitterFactory(cb.build()).getInstance();

        List<Status> statuses = twitter.getUserTimeline("bungie", new Paging(1, 10));

        twitterResponse = new ITwitterResponse();

        for (int i = 0; i < statuses.size(); i++) {
            Status status = statuses.get(i);
            if (i == 0)
                twitterResponse.imageUrl = status.getUser().getBiggerProfileImageURLHttps();

            ITweet tweet = new ITweet(status.getCreatedAt(), status.getText(), status.getFavoriteCount(), status.getRetweetCount());

            twitterResponse.tweets.add(tweet);
        }
        // Cache for 10 minutes
        memCache.put("twitter-bungie", twitterResponse, Expiration.byDeltaSeconds(600));

        return twitterResponse;
    }
}
