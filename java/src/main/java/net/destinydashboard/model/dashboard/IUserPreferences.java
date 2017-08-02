package net.destinydashboard.model.dashboard;

public class IUserPreferences
{
    public static IUserPreferences DEFAULT_USER_PREFERENCES = new IUserPreferences((short) 0);

    public short membershipIndex;

    public IUserPreferences() {
    }

    public IUserPreferences(short membershipIndex) {
        this.membershipIndex = membershipIndex;
    }

}
