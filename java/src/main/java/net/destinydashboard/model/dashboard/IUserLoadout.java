package net.destinydashboard.model.dashboard;

public class IUserLoadout
{
    public String name;
    public String[] itemIds;

    public IUserLoadout() {
    }

    public IUserLoadout(String name, String[] itemIds) {
        this.name = name;
        this.itemIds = itemIds;
    }

    public IUserLoadout(String name, String itemIds) {
        this.name = name;

        String[] itemIdParts = itemIds.split(",");
        this.itemIds = new String[itemIdParts.length];

        for (int i = 0; i < itemIdParts.length; i++)
            this.itemIds[i] = itemIdParts[i];
    }

}
