import PgAuthRepo from "./repo/pg";

export default class AuthService {

    constructor(private repo: PgAuthRepo) {}

    login = async (email: string, password: string) => {
        return await this.repo.login(email, password);
    }

    register = async (email: string, pwd: string, role: number) => {
        return await this.repo.register(email, pwd, role)
    }
}