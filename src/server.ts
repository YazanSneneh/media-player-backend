import { Server, Socket } from "socket.io";
import DBService from "./services/dbService";

const dbConfig = {
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "0000",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "media_player"
};
const dbService = new DBService(dbConfig);

const io = new Server({ 
    cors: {
        origin: "*"
    }
});


io.on('connection', (socket: Socket) => {
    dbService.getMessagesFromDatabase(10);

    socket.on("message", (data) => {
        dbService.insertMessage(data)
            .then(()=>{
                return dbService.getMessagesFromDatabase(10);
            })
            .then((messages) => {
                io.emit("log_entries", messages);
            })
            .catch((err: Error) => {
                console.error("Error storing message in the database:", err);
            });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

io.listen(Number(process.env.PORT) || 3001);
