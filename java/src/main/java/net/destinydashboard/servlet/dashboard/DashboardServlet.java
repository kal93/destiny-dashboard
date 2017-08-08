package net.destinydashboard.servlet.dashboard;

import java.io.BufferedReader;
import java.net.HttpURLConnection;
import java.sql.Connection;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import net.destinydashboard.core.DBCore;
import net.destinydashboard.model.dashboard.IUserDashboard;
import net.destinydashboard.repository.bungie.TokenRepository;
import net.destinydashboard.repository.dashboard.DashboardRepository;
import net.destinydashboard.servlet.BaseServlet;

public class DashboardServlet extends BaseServlet
{
    // Returns a list of dashboards by user
    public void doGet(HttpServletRequest req, HttpServletResponse resp) {
        super.doGet(req, resp);

        try {
            String accessToken = req.getHeader("Authorization");
            if (accessToken == null)
                return;

            try (Connection conn = DBCore.getDBConnection()) {
                long membershipId = TokenRepository.getMembershipIdByAccessToken(accessToken, conn);

                List<IUserDashboard> userDashboards = DashboardRepository.loadUserDashboards(membershipId, conn);

                resp.getWriter().write(new Gson().toJson(userDashboards));
            }
        }
        catch (Exception e) {
            Logger.getLogger("DashboardServlet").log(Level.SEVERE, e.getMessage(), e);
            resp.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR);
        }
    }

    // Saves a single dashboard
    public void doPost(HttpServletRequest req, HttpServletResponse resp) {
        super.doPost(req, resp);

        try {
            String accessToken = req.getHeader("Authorization");
            if (accessToken == null)
                return;

            // Read request body
            StringBuffer requestBody = new StringBuffer();
            String line = null;
            BufferedReader reader = req.getReader();
            while ((line = reader.readLine()) != null)
                requestBody.append(line);

            // Convert request body to object, using Gson
            Gson gson = new GsonBuilder().disableHtmlEscaping().create();
            IUserDashboard userDashboard = gson.fromJson(requestBody.toString(), IUserDashboard.class);

            if (userDashboard.cards.size() > 20)
                throw new IllegalAccessException("User tried to add too many cards.");

            try (Connection conn = DBCore.getDBConnection()) {
                // Get membership id from access token
                long membershipId = TokenRepository.getMembershipIdByAccessToken(accessToken, conn);
                if (membershipId == -1)
                    throw new IllegalAccessException("User made request with bad token.");
                else {

                    // Save to database
                    long newDashboardId = DashboardRepository.saveUserDashboard(membershipId, userDashboard, conn);

                    resp.getWriter().write(new Gson().toJson(newDashboardId));
                }
            }

        }
        catch (Exception e) {
            Logger.getLogger("DashboardServlet").log(Level.SEVERE, e.getMessage(), e);
            resp.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR);
        }
    }

    // Deletes a single dashboard
    public void doDelete(HttpServletRequest req, HttpServletResponse resp) {
        super.doDelete(req, resp);

        try {
            long dashboardId = Long.parseLong(req.getParameter("id"));

            String accessToken = req.getHeader("Authorization");
            if (accessToken == null)
                return;

            try (Connection conn = DBCore.getDBConnection()) {
                // Get membership id from access token
                long membershipId = TokenRepository.getMembershipIdByAccessToken(accessToken, conn);
                if (membershipId == -1)
                    resp.setStatus(HttpURLConnection.HTTP_UNAUTHORIZED);
                else {
                    // Save to database
                    DashboardRepository.deleteUserDashboard(membershipId, dashboardId, conn);
                }
            }

        }
        catch (Exception e) {
            Logger.getLogger("DashboardServlet").log(Level.SEVERE, e.getMessage(), e);
            resp.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR);
        }
    }
}
