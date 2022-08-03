import { users, IUserModel } from "../models";
import { IUser } from "../interfaces";

export class Users {
   static async ById(id: number) {
      return (await users.findByPk(id)) as IUser;
   }
   static async ByEmail(email: string) {
      return (await users.findOne({ where: { email } })) as IUser;
   }
   static async ByExternalId(id: number) {
      return (await users.findOne({ where: { externalId: id } })) as IUser;
   }
   static async Create(user: IUser) {
      return (await users.create(user)) as IUser;
   }
   static async Destroy(id: number) {
      return await users.destroy({ where: { id: id } });
   }
}

