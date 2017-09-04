package net.destinydashboard.repository.utility;

public class Utilities
{
    public static String Join(String[] stringArray, String separator) {
        if(stringArray.length == 0)
            return "";
        StringBuilder sbStr = new StringBuilder();
        for (int i = 0; i < stringArray.length -1;  i++) {
            sbStr.append(stringArray[i]);
            sbStr.append(separator);
        }
        sbStr.append(stringArray[stringArray.length -1]);
        return sbStr.toString();
    }
}
