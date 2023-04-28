import { Sequelize } from "sequelize-typescript";
declare const loadSequelize: (dbHost: string, dbPort: number, dbName: string, dbUsn: string, dbPassword: string, modelPath: string, consoleLog: boolean) => Promise<Sequelize>;
declare const loadSystemSequelize: (dbHost: string, dbPort: number, dbUsn: string, dbPassword: string) => Promise<Sequelize>;
declare const testSystemDb: () => Promise<{
    noRecords: number;
}>;
export { loadSequelize, loadSystemSequelize, testSystemDb };
