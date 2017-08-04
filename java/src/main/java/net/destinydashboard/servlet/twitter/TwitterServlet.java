package net.destinydashboard.servlet.twitter;

import java.net.HttpURLConnection;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import net.destinydashboard.model.twitter.ITwitterResponse;
import net.destinydashboard.repository.twitter.TwitterRepository;

public class TwitterServlet extends HttpServlet
{
    // Returns a list of dashboards by user
    public void doGet(HttpServletRequest req, HttpServletResponse resp) {
        try {
            String twitterType = req.getParameter("type");
            ITwitterResponse twitterResponse = null;
            if (twitterType.equals("bungie"))
                twitterResponse = TwitterRepository.getBungieTwitter();

            resp.getWriter().write(new Gson().toJson(twitterResponse));
            resp.setStatus(HttpURLConnection.HTTP_OK);
        }
        catch (Exception e) {
            Logger.getLogger("TwitterServlet").log(Level.SEVERE, e.getMessage(), e);
            resp.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR);
        }
    }

}
