import express from 'express';
import { Application } from 'express'
import cors from 'cors';
import bodyParser from 'body-parser';

export default class App {
    app: Application
    port: number
    constructor(config: {port: number, middleWares: any, routers: any}) {
        this.app = express()
        this.port = config.port;
      
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.middleWares(config.middleWares);
        this.routes(config.routers);

    }

    private middleWares(middleWares: { forEach: (arg0: (middleware: any) => void) => void; }) {
        middleWares.forEach( middleWare => {
            this.app.use(middleWare);
        });
    }

    private routes(routes: { forEach: (arg0: (controller: any) => void) => void; }) {
        routes.forEach(controller => {
            this.app.use(controller.path || '/', controller.router)
        });
    }

    public async listen(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.app.listen(this.port, () => {
                console.log(`App listening on the http://localhost:${this.port}`);
                resolve();
            });
        });
    }
}