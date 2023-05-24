import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  CreatedAt,
  AutoIncrement
} from "sequelize-typescript";

@Table({
  tableName : "api_request_log",
  updatedAt : false
})
export class ApiRequestLog extends Model<ApiRequestLog> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  public id! : number;

  @Column(DataType.BIGINT)
  public applicationId : number;

  @Column(DataType.STRING)
  public endpoint : string;

  @Column(DataType.STRING)
  public params : string;

  @Column(DataType.STRING)
  public body : string;

  @Column(DataType.STRING)
  public method : string;

  @CreatedAt
  @Column
  public request_time : Date;

}

