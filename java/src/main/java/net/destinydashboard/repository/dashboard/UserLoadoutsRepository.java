package net.destinydashboard.repository.dashboard;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import net.destinydashboard.model.dashboard.IUserLoadout;
import net.destinydashboard.repository.utility.Utilities;

public class UserLoadoutsRepository
{
    public static List<IUserLoadout> loadUserLoadouts(long membershipId, Connection conn) throws SQLException {
        PreparedStatement preparedStatement = conn.prepareStatement("SELECT name, item_ids FROM user_loadouts WHERE membership_id = ?");
        preparedStatement.setLong(1, membershipId);

        List<IUserLoadout> userLoadouts = new ArrayList<IUserLoadout>();

        ResultSet rs = preparedStatement.executeQuery();
        while (rs.next()) {
            IUserLoadout userLoadout = new IUserLoadout(rs.getString(1), rs.getString(2));
            userLoadouts.add(userLoadout);
        }

        preparedStatement.close();

        return userLoadouts;
    }

    public static void saveUserLoadouts(long membershipId, IUserLoadout[] userLoadouts, Connection conn) throws SQLException {
        // Remove existing preference
        Statement statement = conn.createStatement();
        statement.execute("DELETE FROM user_loadouts WHERE membership_id = " + membershipId);
        statement.close();

        PreparedStatement preparedStatement = conn
                .prepareStatement("INSERT INTO user_loadouts (membership_id, name, item_ids) VALUES(?, ?, ?)");

        for (IUserLoadout userLoadout : userLoadouts) {
            preparedStatement.setLong(1, membershipId);
            preparedStatement.setString(2, userLoadout.name);
            preparedStatement.setString(3, Utilities.Join(userLoadout.itemIds, ","));
            preparedStatement.addBatch();
        }

        preparedStatement.executeBatch();
        preparedStatement.close();
    }
}
