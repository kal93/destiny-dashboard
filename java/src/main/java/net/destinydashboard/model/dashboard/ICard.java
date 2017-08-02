package net.destinydashboard.model.dashboard;

public class ICard
{
    public short sequence;
    public short definitionId;
    public short layoutId;

    public ICard() {
    }

    public ICard(short sequence, short definitionId, short layoutId) {
        this.sequence = sequence;
        this.definitionId = definitionId;
        this.layoutId = layoutId;
    }
}
