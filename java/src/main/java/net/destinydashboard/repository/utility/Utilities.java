package net.destinydashboard.repository.utility;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveInputStream;

public class Utilities
{

    public static byte[] unzipByteArray(byte[] zippedBytes) throws Exception {
        ZipArchiveInputStream zipInputStream = new ZipArchiveInputStream(new ByteArrayInputStream(zippedBytes));
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            ZipArchiveEntry entry = zipInputStream.getNextZipEntry();

            int len;
            byte[] buffer = new byte[50000];
            while ((len = zipInputStream.read(buffer)) != -1)
                baos.write(buffer, 0, len);

            return baos.toByteArray();

        }
        finally {
            zipInputStream.close();
            baos.close();
        }
    }

}
