import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixFlyway {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/heaven4", "postgres", "password");
            Statement stmt = conn.createStatement();
            stmt.executeUpdate("UPDATE flyway_schema_history SET checksum = 220004414 WHERE version = '11'");
            stmt.executeUpdate("DROP TABLE IF EXISTS complaints CASCADE");
            stmt.executeUpdate("DELETE FROM flyway_schema_history WHERE version = '11'");
            System.out.println("Flyway history fixed!");
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
