package net.destinydashboard.servlet.bungie;

import java.net.HttpURLConnection;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import net.destinydashboard.repository.bungie.ManifestRepository;
import net.destinydashboard.repository.bungie.ManifestRepository.IManifestRepository;

public class ManifestServlet extends HttpServlet
{
    public void doGet(HttpServletRequest req, HttpServletResponse resp) {
        try {

            byte[] zippedManifest = ManifestRepository.downloadManifest();

            List<IManifestRepository> manifestTables = ManifestRepository.parseManifestDatabase(zippedManifest);

            Gson gson = new GsonBuilder().disableHtmlEscaping().create();
            resp.getWriter().write(gson.toJson(manifestTables));
        }
        catch (Exception e) {
            Logger.getLogger("ManifestServlet").log(Level.SEVERE, e.getMessage(), e);
            resp.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR);
        }
    }
}
