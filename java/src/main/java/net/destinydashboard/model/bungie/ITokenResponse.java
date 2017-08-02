package net.destinydashboard.model.bungie;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class ITokenResponse
{
    public String accessToken;
    public transient String refreshToken;
    public int expiresIn;
    public long membershipId;

    public ITokenResponse(String accessToken, int expiresIn, String refreshToken, long membershipId) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.refreshToken = refreshToken;
        this.membershipId = membershipId;
    }

    public static ITokenResponse parseBungieResponse(String responseBody) {
        JsonObject jo = (JsonObject) new JsonParser().parse(responseBody);

        if (jo.has("error"))
            throw new IllegalStateException(jo.get("error_description").getAsString());

        ITokenResponse tokenResponse = new ITokenResponse(jo.get("access_token").getAsString(), jo.get("expires_in").getAsInt(),
                jo.get("refresh_token").getAsString(), jo.get("membership_id").getAsInt());

        return tokenResponse;
    }
}