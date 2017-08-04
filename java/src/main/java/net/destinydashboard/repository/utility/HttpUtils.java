package net.destinydashboard.repository.utility;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.google.appengine.api.utils.SystemProperty;

public class HttpUtils
{
    private static int HTTP_TIMEOUT = 5000;

    public static class HttpHeader
    {
        public HttpHeader(String key, String[] values) {
            this.key = key;
            this.values = values;
        }

        public String key;
        public String[] values;
    }

    public static class HttpResponse
    {
        public HttpResponse(int statusCode, List<HttpHeader> headers, String body) {
            this.statusCode = statusCode;
            this.headers = headers;
            this.body = body;
        }

        public int statusCode;
        public List<HttpHeader> headers;
        public String body;
    }

    public static class HttpResponseByteArray
    {
        public HttpResponseByteArray(int statusCode, List<HttpHeader> headers, byte[] body) {
            this.statusCode = statusCode;
            this.headers = headers;
            this.body = body;
        }

        public int statusCode;
        public List<HttpHeader> headers;
        public byte[] body;
    }

    public static List<HttpHeader> getBungieTokenHeaders() {
        String useApiKey = "";
        String useEncodedAuth = "";
        String useOrigin = "";

        // Get ApiKey and EncodedAuth values from appengine-web.xml
        if (SystemProperty.environment.value() == SystemProperty.Environment.Value.Production) {
            useApiKey = System.getProperty("prod-api-key");
            useEncodedAuth = System.getProperty("prod-encoded-auth");
            useOrigin = "https://www.destinydashboard.net";
        }
        else {
            useApiKey = System.getProperty("test-api-key");
            useEncodedAuth = System.getProperty("test-encoded-auth");
            useOrigin = "https://localhost:4201";
        }

        List<HttpHeader> headers = new ArrayList<HttpHeader>();

        // DatatypeConverter.printBase64Binary((BUNGIE_API_CLIENT_ID+":"+BUNGIE_API_SECRET).getBytes());
        headers.add(new HttpHeader("Authorization", new String[] { "Basic " + useEncodedAuth }));
        headers.add(new HttpHeader("Content-Type", new String[] { "application/x-www-form-urlencoded" }));
        headers.add(new HttpHeader("Origin", new String[] { useOrigin }));
        headers.add(new HttpHeader("X-API-Key", new String[] { useApiKey }));
        // headers.add(new HttpHeader("User-Agent", new String[] { "api" }));

        return headers;
    }

    public static List<HttpHeader> getBungieBasicHeaders() {
        String useApiKey = "";

        // Get ApiKey and EncodedAuth values from appengine-web.xml
        if (SystemProperty.environment.value() == SystemProperty.Environment.Value.Production)
            useApiKey = System.getProperty("prod-api-key");
        else
            useApiKey = System.getProperty("test-api-key");

        List<HttpHeader> headers = new ArrayList<HttpHeader>();
        headers.add(new HttpHeader("X-API-Key", new String[] { useApiKey }));

        return headers;
    }

    public static HttpResponseByteArray doGetByteArray(String url, List<HttpHeader> headers) throws IOException {
        // Make request
        URL loginURL = new URL(url);
        HttpURLConnection conn = (HttpURLConnection) loginURL.openConnection();
        conn.setDoOutput(true);
        conn.setUseCaches(false);
        conn.setInstanceFollowRedirects(false);
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(HTTP_TIMEOUT);
        conn.setReadTimeout(HTTP_TIMEOUT);

        // Write headers
        if (headers != null) {
            for (HttpHeader header : headers)
                for (String value : header.values)
                    conn.setRequestProperty(header.key, value);
        }

        // Start response

        // Get status code
        int statusCode = conn.getResponseCode();

        // Process headers
        List<HttpHeader> responseHeaders = new ArrayList<HttpHeader>();
        for (Map.Entry<String, List<String>> entry : conn.getHeaderFields().entrySet())
            responseHeaders.add(new HttpHeader(entry.getKey(), entry.getValue().toArray(new String[0])));

        // Process response body
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        InputStream is = conn.getInputStream();
        byte[] byteChunk = new byte[50000];
        int n;
        while ((n = is.read(byteChunk)) > 0)
            baos.write(byteChunk, 0, n);

        return new HttpResponseByteArray(statusCode, responseHeaders, baos.toByteArray());
    }

    public static HttpResponse doGetString(String url, List<HttpHeader> headers) throws IOException {
        URL loginURL = new URL(url);
        HttpURLConnection conn = (HttpURLConnection) loginURL.openConnection();
        conn.setDoOutput(true);
        conn.setUseCaches(false);
        conn.setInstanceFollowRedirects(false);
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(HTTP_TIMEOUT);
        conn.setReadTimeout(HTTP_TIMEOUT);

        // Write headers
        if (headers != null) {
            for (HttpHeader header : headers)
                for (String value : header.values)
                    conn.setRequestProperty(header.key, value);
        }

        // Start response

        // Get status code
        int statusCode = conn.getResponseCode();

        // Process headers
        List<HttpHeader> responseHeaders = new ArrayList<HttpHeader>();
        for (Map.Entry<String, List<String>> entry : conn.getHeaderFields().entrySet())
            responseHeaders.add(new HttpHeader(entry.getKey(), entry.getValue().toArray(new String[0])));

        // Process response body
        String responseBody = "";
        String inputLine;
        BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
        while ((inputLine = reader.readLine()) != null)
            responseBody += inputLine;
        reader.close();

        return new HttpResponse(statusCode, responseHeaders, responseBody);
    }

    public static HttpResponse doPost(String url, List<HttpHeader> headers, String body) throws IOException {
        // Proxy for fiddler
        // System.setProperty("http.proxyHost", "127.0.0.1");
        // System.setProperty("https.proxyHost", "127.0.0.1");
        // System.setProperty("http.proxyPort", "8887");
        // System.setProperty("https.proxyPort", "8887");

        // Make request
        URL loginURL = new URL(url);
        HttpURLConnection conn = (HttpURLConnection) loginURL.openConnection();
        conn.setDoOutput(true);
        conn.setUseCaches(false);
        conn.setInstanceFollowRedirects(false);
        conn.setRequestMethod("POST");
        conn.setConnectTimeout(HTTP_TIMEOUT);
        conn.setReadTimeout(HTTP_TIMEOUT);

        // Write headers
        if (headers != null) {
            for (HttpHeader header : headers)
                for (String value : header.values)
                    conn.setRequestProperty(header.key, value);
        }

        // Write Body
        OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());
        writer.write(body);
        writer.close();

        // Start response

        // Get status code
        int statusCode = conn.getResponseCode();

        // Process headers
        List<HttpHeader> responseHeaders = new ArrayList<HttpHeader>();
        for (Map.Entry<String, List<String>> entry : conn.getHeaderFields().entrySet())
            responseHeaders.add(new HttpHeader(entry.getKey(), entry.getValue().toArray(new String[0])));

        // Process response body
        String responseBody = "";
        String inputLine;
        BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
        while ((inputLine = reader.readLine()) != null)
            responseBody += inputLine;
        reader.close();

        return new HttpResponse(statusCode, responseHeaders, responseBody);
    }
}
