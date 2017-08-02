package net.destinydashboard.repository.bungie;

import java.util.ArrayList;
import java.util.List;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import net.destinydashboard.repository.utility.HttpUtils;
import net.destinydashboard.repository.utility.HttpUtils.HttpResponse;
import net.destinydashboard.repository.utility.HttpUtils.HttpResponseByteArray;
import net.destinydashboard.repository.utility.Utilities;

public class ManifestRepository
{
    public static class IManifestRepository
    {
        public IManifestRepository(String dbName, String json) {
            this.dbName = dbName;
            this.json = json;
        }

        public String dbName;
        public String json;
    }

    public static byte[] downloadManifest() throws Exception {
        // First get meta data about manifest
        HttpResponse manifestResponse = HttpUtils.doGetString("https://www.bungie.net/d1/Platform/Destiny/Manifest/",
                HttpUtils.getBungieBasicHeaders());

        // Parse the response to get the nested
        JsonObject jo = (JsonObject) new JsonParser().parse(manifestResponse.body);

        JsonObject responseElement = jo.get("Response").getAsJsonObject();
        JsonObject mobileWorldContentPathsElement = responseElement.get("mobileWorldContentPaths").getAsJsonObject();
        String sqlLitePath = mobileWorldContentPathsElement.get("en").getAsString();

        HttpResponseByteArray sqlLiteResponse = HttpUtils.doGetByteArray("https://www.bungie.net" + sqlLitePath, null);

        byte[] unzippedBytes = Utilities.unzipByteArray(sqlLiteResponse.body);

        return unzippedBytes;
    }

    public static List<IManifestRepository> parseManifestDatabase(byte[] manifestDbBytes) {
        List<IManifestRepository> manifestTables = new ArrayList<IManifestRepository>();

        return manifestTables;
    }

}
