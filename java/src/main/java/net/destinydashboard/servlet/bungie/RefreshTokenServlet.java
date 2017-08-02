package net.destinydashboard.servlet.bungie;

import java.net.HttpURLConnection;
import java.sql.Connection;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import net.destinydashboard.core.DBCore;
import net.destinydashboard.model.bungie.ITokenResponse;
import net.destinydashboard.repository.bungie.TokenRepository;

public class RefreshTokenServlet extends HttpServlet
{
    public void doPost(HttpServletRequest req, HttpServletResponse resp) {
        try {
            // Read Bungie access token from POST body
            String accessToken = req.getReader().readLine();

            // Fetch refresh token from database
            Connection conn = DBCore.getDBConnection();
            // Fetch the refresh token from the database
            String refreshToken = TokenRepository.getRefreshTokenByAccessToken(accessToken, conn);
            // Close database connection if we're making potentially expensive
            // calls
            conn.close();

            // Get a new tokenReponse from Bungie
            ITokenResponse tokenResponse = TokenRepository.getRefreshToken(refreshToken);

            // Save new access token to database, and delete old one
            conn = DBCore.getDBConnection();
            TokenRepository.deleteAccessToken(accessToken, conn);
            TokenRepository.saveTokenResponse(tokenResponse, conn);
            conn.close();

            // Tell the client what their new access token is
            Gson gson = new GsonBuilder().disableHtmlEscaping().create();
            resp.getWriter().write(gson.toJson(tokenResponse));

        }
        catch (Exception e) {
            Logger.getLogger("RefreshTokenServlet").log(Level.SEVERE, e.getMessage(), e);
            resp.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR);
        }
    }
}
