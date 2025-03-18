import db from "../services/db";  
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";


export const putItem = async (params) => {
  const command = new PutCommand(params); 
  return db.send(command); 
};


export const getItem = async (params) => {
  const command = new GetCommand(params); 
  return db.send(command);
};


export const updateItem = async (params) => {
  const command = new UpdateCommand(params);  
  return db.send(command); 
};


export const deleteItem = async (params) => {
  const command = new DeleteCommand(params);  
  return db.send(command);  
};

export const queryItems = async (params) => {
  const command = new QueryCommand(params);  // crea il comando per fare una query
  return db.send(command);  // invia il comando al db
};


export const scanItems = async (params) => {
  const command = new ScanCommand(params);  
  return db.send(command);  
};
