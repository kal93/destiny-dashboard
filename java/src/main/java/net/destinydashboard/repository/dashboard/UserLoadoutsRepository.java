package net.destinydashboard.repository.dashboard;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import net.destinydashboard.model.dashboard.IUserLoadout;
import net.destinydashboard.repository.utility.Utilities;

public class UserLoadoutsRepository
{
    public static List<IUserLoadout> loadUserLoadouts(long membershipId, int membershipType, Connection conn) throws SQLException {
        PreparedStatement preparedStatement = conn
                .prepareStatement("SELECT name, item_ids FROM user_loadouts WHERE membership_id = ? AND membership_type = ?");
        preparedStatement.setLong(1, membershipId);
        preparedStatement.setInt(2, membershipType);

        List<IUserLoadout> userLoadouts = new ArrayList<IUserLoadout>();

        ResultSet rs = preparedStatement.executeQuery();
        while (rs.next()) {
            IUserLoadout userLoadout = new IUserLoadout(rs.getString(1), rs.getString(2));
            userLoadouts.add(userLoadout);
        }

        preparedStatement.close();

        return userLoadouts;
    }

    public static void saveUserLoadouts(long membershipId, int membershipType, IUserLoadout[] userLoadouts, Connection conn)
            throws SQLException {
        // Remove existing preference
        PreparedStatement preparedStatement = conn
                .prepareStatement("DELETE FROM user_loadouts WHERE membership_id = ? AND membership_type = ?");
        preparedStatement.setLong(1, membershipId);
        preparedStatement.setInt(2, membershipType);
        preparedStatement.execute();
        preparedStatement.close();

        preparedStatement = conn
                .prepareStatement("INSERT INTO user_loadouts (membership_id, membership_type, name, item_ids) VALUES(?, ?, ?, ?)");

        for (IUserLoadout userLoadout : userLoadouts) {
            preparedStatement.setLong(1, membershipId);
            preparedStatement.setInt(2, membershipType);
            preparedStatement.setString(3, userLoadout.name);
            preparedStatement.setString(4, Utilities.Join(userLoadout.itemIds, ","));
            preparedStatement.addBatch();
        }

        preparedStatement.executeBatch();
        preparedStatement.close();
    }
}
