CREATE TABLE IF NOT EXISTS Posts (
    idx INTEGER PRIMARY KEY,
    title TEXT,
    recent_date DATE,
    readCheck INTEGER,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);