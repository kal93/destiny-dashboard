package net.destinydashboard.servlet.dashboard;

import java.io.BufferedReader;
import java.net.HttpURLConnection;
import java.sql.Connection;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import net.destinydashboard.core.DBCore;
import net.destinydashboard.model.dashboard.IUserPreferences;
import net.destinydashboard.repository.bungie.TokenRepository;
import net.destinydashboard.repository.dashboard.PreferenceRepository;
import net.destinydashboard.servlet.BaseServlet;

public class PreferencesServlet extends BaseServlet
{

    public void doGet(HttpServletRequest req, HttpServletResponse resp) {
        super.doGet(req, resp);
        
        try {
            String accessToken = req.getHeader("Authorization");
            if (accessToken == null)
                return;

            try (Connection conn = DBCore.getDBConnection()) {
                long membershipId = TokenRepository.getMembershipIdByAccessToken(accessToken, conn);

                IUserPreferences userPreferences = PreferenceRepository.loadUserPreferences(membershipId, conn);

                resp.getWriter().write(new Gson().toJson(userPreferences));
            }

        }
        catch (Exception e) {
            Logger.getLogger("PreferencesServlet").log(Level.SEVERE, e.getMessage(), e);
            resp.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR);
        }
    }

    public void doPost(HttpServletRequest req, HttpServletResponse resp) {
        super.doPost(req, resp);
        
        try {
            String accessToken = req.getHeader("Authorization");
            if (accessToken == null)
                return;

            try (Connection conn = DBCore.getDBConnection()) {
                long membershipId = TokenRepository.getMembershipIdByAccessToken(accessToken, conn);
                if (membershipId == -1)
                    resp.setStatus(HttpURLConnection.HTTP_UNAUTHORIZED);
                else {
                    // Read request body
                    StringBuffer requestBody = new StringBuffer();
                    String line = null;
                    BufferedReader reader = req.getReader();
                    while ((line = reader.readLine()) != null)
                        requestBody.append(line);

                    // Convert request body to object, using Gson
                    Gson gson = new GsonBuilder().disableHtmlEscaping().create();
                    IUserPreferences userPreferences = gson.fromJson(requestBody.toString(), IUserPreferences.class);

                    // Save to database
                    PreferenceRepository.saveUserPreferences(membershipId, userPreferences, conn);
                    resp.setStatus(HttpURLConnection.HTTP_OK);
                }
            }

        }
        catch (Exception e) {
            Logger.getLogger("PreferencesServlet").log(Level.SEVERE, e.getMessage(), e);
            resp.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR);
        }
    }
}
