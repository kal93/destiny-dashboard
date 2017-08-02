package net.destinydashboard.repository.bungie;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

import com.google.appengine.api.memcache.Expiration;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;

import net.destinydashboard.model.bungie.ITokenResponse;
import net.destinydashboard.repository.utility.HttpUtils;
import net.destinydashboard.repository.utility.HttpUtils.HttpHeader;
import net.destinydashboard.repository.utility.HttpUtils.HttpResponse;

public class TokenRepository
{

    private static String TOKEN_URL = "https://www.bungie.net/platform/app/oauth/token/";

    private static MemcacheService memCache = MemcacheServiceFactory.getMemcacheService();

    public static ITokenResponse getAccessToken(String bungieAuthCode) throws Exception {
        List<HttpHeader> headers = HttpUtils.getBungieTokenHeaders();

        String requestBody = "grant_type=authorization_code&code=" + bungieAuthCode;

        HttpResponse response = HttpUtils.doPost(TOKEN_URL, headers, requestBody);

        return ITokenResponse.parseBungieResponse(response.body);
    }

    public static ITokenResponse getRefreshToken(String bungieRefreshToken) throws Exception {
        List<HttpHeader> headers = HttpUtils.getBungieTokenHeaders();
        String requestBody = "grant_type=refresh_token&refresh_token=" + bungieRefreshToken;

        HttpResponse response = HttpUtils.doPost(TOKEN_URL, headers, requestBody);

        return ITokenResponse.parseBungieResponse(response.body);
    }

    public static void saveTokenResponse(ITokenResponse tokenResponse, Connection conn) throws SQLException {
        // Insert the new token session
        try (PreparedStatement preparedStatement = conn.prepareStatement(
                "INSERT INTO token (membership_id, access_token, refresh_token, expires) VALUES(?, ?, ?, DATE_ADD(now(), INTERVAL ? SECOND))")) {
            preparedStatement.setLong(1, tokenResponse.membershipId);
            preparedStatement.setString(2, tokenResponse.accessToken);
            preparedStatement.setString(3, tokenResponse.refreshToken);
            preparedStatement.setInt(4, tokenResponse.expiresIn);

            preparedStatement.execute();

            memCache.put(tokenResponse.accessToken, tokenResponse.membershipId, Expiration.byDeltaSeconds(1800));
        }
    }

    public static void deleteAccessToken(String accessToken, Connection conn) throws SQLException {
        try (PreparedStatement preparedStatement = conn.prepareStatement("DELETE FROM token WHERE access_token =  ?")) {
            preparedStatement.setString(1, accessToken);
            preparedStatement.execute();
        }
    }

    public static String getRefreshTokenByAccessToken(String accessToken, Connection conn) throws SQLException {
        try (PreparedStatement preparedStatement = conn.prepareStatement("SELECT refresh_token FROM token WHERE access_token = ?")) {
            preparedStatement.setString(1, accessToken);

            String refreshToken = null;
            ResultSet rs = preparedStatement.executeQuery();
            if (rs.next())
                refreshToken = rs.getString(1);
            return refreshToken;
        }
    }

    public static long getMembershipIdByAccessToken(String accessToken, Connection conn) throws SQLException {
        // Try to load from memory first
        Long membershipId = (Long) memCache.get(accessToken);
        if (membershipId != null)
            return membershipId;

        // Otherwise, load from database then save to memcahe for 10 minutes
        try (PreparedStatement preparedStatement = conn.prepareStatement("SELECT membership_id FROM token WHERE access_token = ?")) {
            preparedStatement.setString(1, accessToken);

            ResultSet rs = preparedStatement.executeQuery();
            if (rs.next())
                membershipId = rs.getLong(1);

            preparedStatement.close();

            if (membershipId == null)
                return -1;

            memCache.put(accessToken, membershipId, Expiration.byDeltaSeconds(1800));

            return membershipId;
        }
    }

    public static void cleanOldTokens(Connection conn) throws SQLException {
        try (Statement statement = conn.createStatement()) {
            statement.execute("DELETE FROM token WHERE updated <= NOW() - INTERVAL 90 DAY");
        }
    }

}
