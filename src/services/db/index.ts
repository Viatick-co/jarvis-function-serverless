import { Sequelize } from "sequelize-typescript";
import { OciFunctionErrorLog } from "./system-models/OciFunctionErrorLog";

const loadSequelize = async (
  dbHost : string,
  dbPort : number,
  dbName : string,
  dbUsn : string,
  dbPassword : string,
  modelPath : string,
  consoleLog : boolean
) : Promise<Sequelize> => {
  const sequelize = new Sequelize(dbName, dbUsn, dbPassword, {
    host : dbHost,
    port : dbPort,
    dialect : "mysql",
    pool : {
      max : 40,
      min : 0,
      idle : 0,
      acquire : 3000,
      evict : 10000
    },
    define : {
      charset : "utf8mb4_unicode_ci",
      underscored : true
    },
    sync : { force : false },
    models : [modelPath],
    logging : consoleLog
  });

  return sequelize;
};

const loadSystemSequelize = async (
  dbHost : string,
  dbPort : number,
  dbUsn : string,
  dbPassword : string
) : Promise<Sequelize> => {
  const sequelize = new Sequelize("jarvis-system", dbUsn, dbPassword, {
    host : dbHost,
    port : dbPort,
    dialect : "mysql",
    pool : {
      max : 40,
      min : 0,
      idle : 0,
      acquire : 3000,
      evict : 10000
    },
    define : {
      charset : "utf8mb4_unicode_ci",
      underscored : true
    },
    sync : { force : false },
    models : [__dirname + "/system-models"],
    logging : false
  });

  return sequelize;
};

const testSystemDb = async () : Promise<{
  noRecords : number
}> => {
  const noRecords = await OciFunctionErrorLog.count();

  return { noRecords };
}

export {
  loadSequelize,
  loadSystemSequelize,
  testSystemDb
};
