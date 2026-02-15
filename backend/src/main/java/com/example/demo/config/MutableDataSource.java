package com.example.demo.config;
import org.springframework.jdbc.datasource.AbstractDataSource;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.concurrent.atomic.AtomicReference;


// --- Clase para permitir el cambio dinámico ---
public class MutableDataSource extends AbstractDataSource {
    private final AtomicReference<DataSource> current = new AtomicReference<>();
    public MutableDataSource(DataSource initial) { this.current.set(initial); }
    public void switchTo(DataSource newDataSource) { this.current.set(newDataSource); }
    @Override
    public Connection getConnection() throws SQLException { return current.get().getConnection(); }
    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        return current.get().getConnection(username, password);
    }
}

