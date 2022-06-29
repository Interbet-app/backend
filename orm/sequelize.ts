import { Sequelize } from "sequelize";

const logging = process.env.NODE_ENV == "development";
const name = process.env.DATABASE_NAME!;
const user = process.env.DATABASE_USER!;
const password = process.env.DATABASE_PASSWORD;
const host = process.env.DATABASE_HOST;

const Database = new Sequelize(name, user, password, {
   dialect: "mysql",
   host: host,
   logging: logging,
   timezone: "+00:00",
});

export default Database;