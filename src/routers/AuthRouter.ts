import AuthController from "../controllers/auth";
import express from 'express';

export class AuthRouter {

    router = express.Router();
    path="/auth";

    constructor(authController: AuthController) {
        this.router.post('/login', authController.login)
        this.router.post('/register', authController.register)
        this.router.post('/update', authController.updateThemeUser)
    }
}