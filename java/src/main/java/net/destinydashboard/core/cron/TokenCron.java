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
import net.destinydashboard.repository.bungie.TokenRepository;

public class TokenCron extends HttpServlet
{
    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            // App engine will add this header if it's calling a schedule cron
            // job. It will also remove this header if called from an external
            // source.
            String cronHeader = req.getHeader("X-Appengine-Cron");
            if (cronHeader == null)
                throw new IllegalAccessException("X-Appengine-Cron header not found!");

            try (Connection conn = DBCore.getDBConnection()) {

                TokenRepository.cleanOldTokens(conn);
                resp.setStatus(HttpURLConnection.HTTP_OK);
            }

        }
        catch (Exception e) {
            Logger.getLogger("TokenCron").log(Level.SEVERE, e.getMessage(), e);
            resp.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR);
        }
    }
}