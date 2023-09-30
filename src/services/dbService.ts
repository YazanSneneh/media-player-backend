import { Client, QueryResult } from "pg";

class DBService {
    private dbClient: Client;

    constructor(dbConfig: any) {
        this.dbClient = new Client(dbConfig);
        this.dbClient.connect();
    }

    async disconnect(): Promise<void> {
        try {
            await this.dbClient.end();
            console.log("Disconnected from the database");
        } catch (err) {
            console.error("Error disconnecting from the database:", err);
        }
    }

    async createMessagesTable(): Promise<void> {
        const createMessagesTableQuery = `
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                text TEXT,
                timestamp TIMESTAMPTZ DEFAULT NOW()
            );
        `;

        try {
            await this.dbClient.query(createMessagesTableQuery);
            console.log("Messages table created or already exists");
        } catch (err) {
            console.error("Error creating messages table:", err);
        }
    }

    async getMessagesFromDatabase(limit: number): Promise<any[]> {
        const query = `SELECT * FROM messages ORDER BY timestamp DESC LIMIT $1`;
        try {
            const result: QueryResult = await this.dbClient.query(query, [limit]);
            return result.rows;
        } catch (err) {
            console.error("Error retrieving messages from the database:", err);
            return [];
        }
    }

    async insertMessage(text: string): Promise<void> {
        const insertMessageQuery = "INSERT INTO messages (text) VALUES ($1)";
        try {
            await this.dbClient.query(insertMessageQuery, [text]);
        } catch (err) {
            console.error("Error storing message in the database:", err);
        }
    }
}

export default DBService;
