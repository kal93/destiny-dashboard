package net.destinydashboard.repository.dashboard;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import net.destinydashboard.model.dashboard.ICard;
import net.destinydashboard.model.dashboard.IUserDashboard;

public class DashboardRepository
{
    public static List<IUserDashboard> loadUserDashboards(long membershipId, Connection conn) throws SQLException {
        Statement statement = conn.createStatement();
        List<IUserDashboard> userDashboards = new ArrayList<IUserDashboard>();

        ResultSet rs = statement.executeQuery("SELECT id, name FROM user_dashboard WHERE membership_id = " + membershipId);
        while (rs.next()) {
            IUserDashboard userDashboard = new IUserDashboard(rs.getLong(1), rs.getString(2));
            userDashboards.add(userDashboard);
        }
        statement.close();

        PreparedStatement preparedStatement = conn.prepareStatement(
                "SELECT sequence, definition_id, layout_id FROM user_dashboard_cards WHERE dashboard_id = ? ORDER BY sequence");

        for (IUserDashboard userDashboard : userDashboards) {
            preparedStatement.setLong(1, userDashboard.id);
            ResultSet rs2 = preparedStatement.executeQuery();

            while (rs2.next())
                userDashboard.cards.add(new ICard(rs2.getShort(1), rs2.getShort(2), rs2.getShort(3)));
        }
        
        preparedStatement.close();

        return userDashboards;

    }

    public static long saveUserDashboard(long membershipId, IUserDashboard userDashboard, Connection conn)
            throws IllegalAccessException, SQLException {

        long dashboardId = -1;
        String name = "";

        if (userDashboard.id < 0) {
            // Make sure user has < 7 dashboards created
            try (Statement statement = conn.createStatement()) {
                ResultSet rs = statement.executeQuery("SELECT count(*) FROM user_dashboard WHERE membership_id = " + membershipId);
                rs.next();
                int dashboardCount = rs.getInt(1);
                if (dashboardCount >= 7)
                    throw new IllegalAccessException("User attempted to create too many dashboards.");

                rs.close();
            }

            // Create a new dashboard entry for this user
            try (PreparedStatement preparedStatement = conn
                    .prepareStatement("INSERT INTO user_dashboard (membership_id, name) VALUES(?, ?)", Statement.RETURN_GENERATED_KEYS)) {
                preparedStatement.setLong(1, membershipId);
                preparedStatement.setString(2, userDashboard.name);
                preparedStatement.executeUpdate();

                // Get newly inserted dashboard_id
                try (ResultSet generatedKeys = preparedStatement.getGeneratedKeys()) {
                    if (generatedKeys.next())
                        dashboardId = generatedKeys.getLong(1);
                    else
                        throw new SQLException("Creating user failed, no ID obtained.");
                }
            }
        }

        else {
            // Updating existing dashboard

            // Make sure user owns this dashboard
            try (PreparedStatement preparedStatement = conn
                    .prepareStatement("SELECT id, name FROM user_dashboard WHERE id = ? AND membership_id = ?")) {
                preparedStatement.setLong(1, userDashboard.id);
                preparedStatement.setLong(2, membershipId);

                ResultSet rs = preparedStatement.executeQuery();
                if (!rs.next())
                    throw new IllegalAccessException("User does not have access to dashboard");

                dashboardId = rs.getLong(1);
                name = rs.getString(2);
                rs.close();
            }

            // Rename dashboard if needed
            if (!userDashboard.name.equals(name)) {
                try (PreparedStatement preparedStatement = conn.prepareStatement("UPDATE user_dashboard SET name = ? WHERE id = ?")) {
                    preparedStatement.setString(1, userDashboard.name);
                    preparedStatement.setLong(2, dashboardId);
                    preparedStatement.execute();
                }
            }

            try (Statement statement = conn.createStatement()) {
                // Remove existing cards
                statement.execute("DELETE FROM user_dashboard_cards WHERE dashboard_id = " + dashboardId);
            }
        }

        // Insert new cards
        try (PreparedStatement preparedStatement = conn
                .prepareStatement("INSERT INTO user_dashboard_cards (dashboard_id, sequence, definition_id, layout_id) VALUES(?, ?, ?, ?)")) {

            for (ICard userCard : userDashboard.cards) {
                preparedStatement.setLong(1, dashboardId);
                preparedStatement.setLong(2, userCard.sequence);
                preparedStatement.setLong(3, userCard.definitionId);
                preparedStatement.setLong(4, userCard.layoutId);
                preparedStatement.addBatch();
            }

            preparedStatement.executeBatch();
        }

        return dashboardId;

    }

    public static void deleteUserDashboard(long membershipId, long dashboardId, Connection conn)
            throws IllegalAccessException, SQLException {
        // Verify user owns the dashboard
        try (PreparedStatement preparedStatement = conn
                .prepareStatement("SELECT id FROM user_dashboard WHERE id = ? AND membership_id = ?")) {
            preparedStatement.setLong(1, dashboardId);
            preparedStatement.setLong(2, membershipId);

            ResultSet rs = preparedStatement.executeQuery();
            if (!rs.next())
                throw new IllegalAccessException("User does not have access to dashboard");

            rs.close();
        }

        try (Statement statement = conn.createStatement()) {
            // Remove existing cards
            statement.execute("DELETE FROM user_dashboard_cards WHERE dashboard_id = " + dashboardId);
        }

        try (PreparedStatement preparedStatement = conn.prepareStatement("DELETE FROM user_dashboard WHERE id = ? AND membership_id = ?")) {
            preparedStatement.setLong(1, dashboardId);
            preparedStatement.setLong(2, membershipId);
            preparedStatement.execute();
        }

    }
}
