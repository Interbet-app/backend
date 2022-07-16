import { events, IEventModel } from "../models";
import { IEvent } from "../interfaces";

export class Events {
   static async getAll(): Promise<IEventModel[]> {
      return await events.findAll();
   }
   static async getById(id: number): Promise<IEventModel | null> {
      return await events.findByPk(id);
   }
   static async create(event: IEvent): Promise<IEventModel> {
      return await events.create(event);
   }
   static async delete(id: number): Promise<number> {
      return await events.destroy({ where: { id: id } });
   }
}

