"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSystemDb = exports.loadSystemSequelize = exports.loadSequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const OciFunctionErrorLog_1 = require("./system-models/OciFunctionErrorLog");
const loadSequelize = (dbHost, dbPort, dbName, dbUsn, dbPassword, modelPath, consoleLog) => __awaiter(void 0, void 0, void 0, function* () {
    const sequelize = new sequelize_typescript_1.Sequelize(dbName, dbUsn, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: "mysql",
        pool: {
            max: 40,
            min: 0,
            idle: 0,
            acquire: 3000,
            evict: 10000
        },
        define: {
            charset: "utf8mb4_unicode_ci",
            underscored: true
        },
        sync: { force: false },
        models: [modelPath],
        logging: consoleLog
    });
    return sequelize;
});
exports.loadSequelize = loadSequelize;
const loadSystemSequelize = (dbHost, dbPort, dbUsn, dbPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const sequelize = new sequelize_typescript_1.Sequelize("jarvis-system", dbUsn, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: "mysql",
        pool: {
            max: 40,
            min: 0,
            idle: 0,
            acquire: 3000,
            evict: 10000
        },
        define: {
            charset: "utf8mb4_unicode_ci",
            underscored: true
        },
        sync: { force: false },
        models: [__dirname + "/system-models"],
        logging: false
    });
    return sequelize;
});
exports.loadSystemSequelize = loadSystemSequelize;
const testSystemDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const noRecords = yield OciFunctionErrorLog_1.OciFunctionErrorLog.count();
    return { noRecords };
});
exports.testSystemDb = testSystemDb;
