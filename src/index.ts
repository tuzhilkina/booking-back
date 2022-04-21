import App from "./express";
import MsAuthRepo from "./services/auth/repo/mssql";
import { config, ConnectionPool } from 'mssql'
import * as dotenv from 'dotenv';
import { AuthRouter } from "./routers/AuthRouter";
import AuthService from "./services/auth";
import AuthController from "./controllers/auth";
import { Pool } from "pg";
import PgAuthRepo from "./services/auth/repo/pg";
import { ApiRouter } from "./routers/ApiRouter";
import ApiController from "./controllers/api";
import BookingService from "./services/booking";
import BookingRepo from "./services/booking/repo";
import {createClient} from 'redis';
import { MongoClient } from "mongodb";

dotenv.config();
// repos

async function main() {
    
    const client = createClient({
        socket: {
            port: 6379,
            host: "65.21.178.72"
        }
    });
    const mongo = new MongoClient('mongodb://65.21.178.72:27017');
    await mongo.connect();
    client.on("connect", () => console.log(`Connected to redis`))
    client.connect();
    const pgSql = new Pool();
    const authRepo = new PgAuthRepo(pgSql);
    const bookingRepo = new BookingRepo(pgSql);
    const authService = new AuthService(authRepo);
    const bookingService = new BookingService(bookingRepo);

    const authController = new AuthController(authService, mongo);
    const apiController = new ApiController(bookingService, client, mongo);

    const app = new App({
        port: 3000,
        middleWares: [],
        routers: [
            new AuthRouter(authController),
            new ApiRouter(apiController)
        ]
    });
    
    await app.listen();
}

main().then();