const { sequelize } = require('./src/database');

async function createTable() {
    try {
        await sequelize.authenticate();

        const query = `
        CREATE TABLE IF NOT EXISTS PlayHistories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip VARCHAR(255),
            userAgent VARCHAR(255),
            completed BOOLEAN DEFAULT 0,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL,
            TrackId INTEGER REFERENCES Tracks(id) ON DELETE SET NULL ON UPDATE CASCADE,
            UserId INTEGER REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE
        );
        `;

        await sequelize.query(query);
        console.log("PlayHistories table created successfully.");

    } catch (e) {
        console.error("Error creating table:", e);
    }
}

createTable();
