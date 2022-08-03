import { adds } from "../models";
import { IAdds } from "../interfaces";

export class Adds {
   static async All() {
      return (await adds.findAll()) as IAdds[];
   }
   static async ById(id: number) {
      return (await adds.findByPk(id)) as IAdds;
   }
   static async Create(add: IAdds) {
      return (await adds.create(add)) as IAdds;
   }
   static async Destroy(id: number) {
      return await adds.destroy({ where: { id: id } });
   }
}

