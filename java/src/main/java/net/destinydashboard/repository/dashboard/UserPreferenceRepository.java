package net.destinydashboard.repository.dashboard;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import net.destinydashboard.model.dashboard.IUserPreferences;

public class UserPreferenceRepository
{
    public static IUserPreferences loadUserPreferences(long membershipId, Connection conn) throws SQLException {

        PreparedStatement preparedStatement = conn.prepareStatement("SELECT membership_index FROM user_preferences WHERE membership_id = ?");
        preparedStatement.setLong(1, membershipId);

        IUserPreferences userPreferences = null;

        ResultSet rs = preparedStatement.executeQuery();
        while (rs.next())
            userPreferences = new IUserPreferences(rs.getShort(1));

        preparedStatement.close();

        if (userPreferences == null)
            return IUserPreferences.DEFAULT_USER_PREFERENCES;
        return userPreferences;
    }

    public static void saveUserPreferences(long membershipId, IUserPreferences userPreferences, Connection conn) throws SQLException {
        // Remove existing preference
        Statement statement = conn.createStatement();
        statement.execute("DELETE FROM user_preferences WHERE membership_id = " + membershipId);
        statement.close();

        // Insert new preference
        PreparedStatement preparedStatement = conn
                .prepareStatement("INSERT INTO user_preferences (membership_id, membership_index) VALUES(?, ?)");

        preparedStatement.setLong(1, membershipId);
        preparedStatement.setShort(2, userPreferences.membershipIndex);

        preparedStatement.execute();
        preparedStatement.close();
    }
}
