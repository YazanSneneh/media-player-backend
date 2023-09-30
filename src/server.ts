import { Server, Socket } from "socket.io";
import DBService from "./services/dbService";
import dotenv from 'dotenv';


dotenv.config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME
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
