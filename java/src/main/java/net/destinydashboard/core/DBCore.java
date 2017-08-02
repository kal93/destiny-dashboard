package net.destinydashboard.core;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import com.google.appengine.api.utils.SystemProperty;

public class DBCore
{
    public static Connection getDBConnection() throws SQLException {
        String connectionString;
        if (SystemProperty.environment.value() == SystemProperty.Environment.Value.Production) {
            connectionString = System.getProperty("cloudsql-database-url");
            try {
                Class.forName("com.mysql.jdbc.GoogleDriver");
            }
            catch (ClassNotFoundException e) {
                throw new SQLException("Error loading Google JDBC Driver", e);
            }
        }
        else {
            connectionString = System.getProperty("local-database-url");
            try {
                Class.forName("com.mysql.jdbc.Driver");
            }
            catch (ClassNotFoundException e) {
                e.printStackTrace();
            }
        }
        return DriverManager.getConnection(connectionString);
    }
}
