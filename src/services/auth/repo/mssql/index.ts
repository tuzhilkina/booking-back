import { ConnectionPool, IResult, VarChar, Int } from "mssql";
import { PoolClient } from "pg";
import { User } from "../../../../interface";
export default class MsAuthRepo {
    constructor(private sql: PoolClient) {}

    login = async (email: string, password: string) => {
        try {
            const result: IResult<User> = await this.sql
                .request()
                .input("EMAIL", VarChar, email)
                .input("PASSWORD", VarChar, password)
                .query(
                    "select * from [user] where EMAIL=@Email and PASSWORD=@PASSWORD"
                );
            return result.recordset[0];
        } catch (error) {
            console.log(error);
        }
    };

    register = async (email: string, password: string, role: number) => {
        try {
            const lastId = await this.sql.request()
            .query("select count(id) as count from [user]");

            console.log(lastId);

            const result = await this.sql
                .request()
                .input("email", VarChar, email)
                .input("password", VarChar, password)
                .input("role", Int, role)
                .input("id", Int, lastId.recordset[0].count + 1)
                .query(
                    `insert into [user] (EMAIL, PASSWORD, ROLE, ID) values (@email,@password,@role, @id)
                     select * from [user] where id=@id 
                    `
                );
            return result.recordset[0];
        } catch (error) {
            console.log(error);
        }
    };
}
