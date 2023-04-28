import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  CreatedAt,
  AutoIncrement
} from "sequelize-typescript";

import {
  RequestBodyPayload,
  RequestParams
} from "../../../types";

@Table({
  tableName : "oci_function_error_log",
  updatedAt : false
})
export class OciFunctionErrorLog extends Model<OciFunctionErrorLog> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  public id! : number;

  @Column(DataType.BIGINT)
  public applicationId : number;

  @Column(DataType.STRING)
  public serviceName : string;

  @Column(DataType.STRING)
  public path : string;

  @Column(DataType.JSON)
  public params : RequestParams;

  @Column(DataType.JSON)
  public body : RequestBodyPayload;

  @Column(DataType.STRING)
  public errorMessage : string;

  @Column(DataType.STRING)
  public errorStack : string;

  @CreatedAt
  @Column
  public recordDatetime! : Date;

}

