import { Pool, QueryResult } from "pg";
import { User } from "../../../../interface";

export default class PgAuthRepo {
    constructor(private pool: Pool) {}

    login = async (email: string, password: string): Promise<User | null> => {
        try {
            const result: QueryResult<User> = await this.pool.query(
                "select * from public.user where email=$1 and password=$2",
                [email, password]
            );
            return result.rows[0];
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    register = async (email: string, password: string, role: number) => {
        try {
            const lastId:QueryResult<{count:number}> = await this.pool.query(
                "select * from public.user"
            );

            const result:QueryResult<User> = await this.pool
                .query(
                    `insert into public.user (EMAIL, PASSWORD, ROLE, ID) values ($1,$2,$3,$4)`,
                    [email,password,role,lastId.rowCount + 1]
                );
            if (result.rowCount > 0) {
                const user = await this.pool.query("select * from public.user where id=$1", [lastId.rowCount + 1])
                return user.rows[0];
            }
        } catch (error) {
            console.log(error);
        }
    };
}
