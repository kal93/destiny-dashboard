package net.destinydashboard.core.cron;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.sql.Connection;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.destinydashboard.core.DBCore;

public class DatabaseMaintenanceCron extends HttpServlet
{

    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            try (Connection conn = DBCore.getDBConnection()) {
                // TokenRepository.cleanOldTokens(conn);
                // resp.setStatus(HttpURLConnection.HTTP_OK);

                // TODO:
                // Clean up rows in dashboard_cards where not exists in
                // user_dashboard
            }

        }
        catch (Exception e) {
            Logger.getLogger("TokenCron").log(Level.SEVERE, e.getMessage(), e);
            resp.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR);
        }
    }

}
