package net.destinydashboard.servlet.bungie;

import java.net.HttpURLConnection;
import java.sql.Connection;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import net.destinydashboard.core.DBCore;
import net.destinydashboard.model.bungie.ITokenResponse;
import net.destinydashboard.repository.bungie.TokenRepository;
import net.destinydashboard.servlet.BaseServlet;

public class AccessTokenServlet extends BaseServlet
{
    public void doPost(HttpServletRequest req, HttpServletResponse resp) {
        super.doPost(req, resp);
        
        try {
            // Read one time use bungieAuthCode POST body parameters
            String bungieAuthCode = req.getReader().readLine();

            // Get the access and refresh token from Bungie with our one time
            // auth code
            ITokenResponse tokenResponse = TokenRepository.getAccessToken(bungieAuthCode);

            try (Connection conn = DBCore.getDBConnection()) {
                // Save token data to database
                TokenRepository.saveTokenResponse(tokenResponse, conn);
            }

            // Tell the client what their access token is
            Gson gson = new GsonBuilder().disableHtmlEscaping().create();
            resp.getWriter().write(gson.toJson(tokenResponse));

        }
        catch (IllegalStateException e) {
            Logger.getLogger("AccessTokenServlet").log(Level.SEVERE, e.getMessage(), e);
            resp.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR);
        }
        catch (Exception e) {
            Logger.getLogger("AccessTokenServlet").log(Level.SEVERE, e.getMessage(), e);
            resp.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR);
        }
    }

    // Deletes an access token (on logout)
    public void doDelete(HttpServletRequest req, HttpServletResponse resp) {
        super.doDelete(req, resp);
        
        try {
            String accessToken = req.getHeader("Authorization");
            if (accessToken == null)
                return;

            try (Connection conn = DBCore.getDBConnection()) {
                TokenRepository.deleteAccessToken(accessToken, conn);
            }
        }
        catch (Exception e) {
            Logger.getLogger("AccessTokenServlet").log(Level.SEVERE, e.getMessage(), e);
            resp.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR);
        }
    }
}
