package net.destinydashboard.model.dashboard;

import java.util.ArrayList;
import java.util.List;

public class IUserDashboard
{
    public long id;
    public String name;
    public List<ICard> cards;

    public IUserDashboard() {
    }

    public IUserDashboard(long dashboardId, String dashboardName) {
        this.id = dashboardId;
        this.name = dashboardName;
        this.cards = new ArrayList<ICard>();
    }
}
