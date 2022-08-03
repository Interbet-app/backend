import { events } from "../models";
import { IEvent } from "../interfaces";

export class Events {
   static async All() {
      return (await events.findAll()) as IEvent[];
   }
   static async ById(id: number) {
      return (await events.findByPk(id)) as IEvent;
   }
   static async Create(event: IEvent) {
      return (await events.create(event)) as IEvent;
   }
   static async Destroy(id: number): Promise<number> {
      return await events.destroy({ where: { id: id } });
   }
}

