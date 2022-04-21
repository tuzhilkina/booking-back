import { Request, Response } from 'express';
import { MongoClient } from 'mongodb';
import AuthService from '../../services/auth';


export default class AuthController {

    constructor (private authService: AuthService, private mongo: MongoClient) {}

    
    private updateTheme = async (id: number, black: boolean) => {
        return await this.mongo.db('mongo').collection('theme').updateOne({ id },{
            $set: {
                id,
                black
            }
        }, {
            upsert: true
        });
    }

    private getTheme = async (id: number) => {
        return await this.mongo.db('mongo').collection('theme').findOne({id})
    }

    updateThemeUser = async (req: Request, res: Response) => {
        try {
            const { id, black } = req.body;
            const resp = await this.updateTheme(id, black);
            res.status(200).json(resp)
        } catch (error) {
            console.log(error)
            res.status(500).send("Internal Error");
        }
    }

    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw {};
            }
            const resp = await this.authService.login(email, password);
            const theme = await this.getTheme(resp?.id || 0)
            res.status(200).json({
                black: theme?.black || false,
                ...resp
            });
        } catch (error) {
            console.log(error)
            res.status(500).send("Internal Error");
        }
    }

    register = async (req: Request, res: Response) => {
        try {
            const { email, password, role } = req.body;

            if (!email || !password) {
                throw {};
            }
            const resp = await this.authService.register(email, password, Number(role));
            res.status(200).json(resp);
        } catch (error) {
            console.log(error)
            res.status(500).send("Internal Error");
        }
    }
}