package net.destinydashboard.servlet;

import java.net.HttpURLConnection;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.utils.SystemProperty;

public class BaseServlet extends HttpServlet
{
    public void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        this.addCORSHeaders(resp);
    }

    public void doGet(HttpServletRequest req, HttpServletResponse resp) {
        this.addCORSHeaders(resp);
    }

    public void doPost(HttpServletRequest req, HttpServletResponse resp) {
        this.addCORSHeaders(resp);
    }

    public void doPut(HttpServletRequest req, HttpServletResponse resp) {
        this.addCORSHeaders(resp);
    }

    public void doDelete(HttpServletRequest req, HttpServletResponse resp) {
        this.addCORSHeaders(resp);
    }

    private void addCORSHeaders(HttpServletResponse resp) {
        if (SystemProperty.applicationId.get().equals("destiny-dashboard-test")) {
            resp.addHeader("Access-Control-Allow-Origin", "https://localhost:4201");
            resp.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, HEAD");
            resp.addHeader("Access-Control-Allow-Headers", " Accept, Authorization, Content-Type, Origin");
            resp.setHeader("Access-Control-Max-Age", "86400");
            resp.setStatus(HttpURLConnection.HTTP_OK);
        }
    }

}
