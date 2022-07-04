import { users, IUserModel } from "../models";
import { IUser } from "../interfaces";

export class Users {
   static getById(id: number): Promise<IUserModel | null> {
      return users.findByPk(id);
   }
   static getByEmail(email: string): Promise<IUserModel | null> {
      return users.findOne({ where: { email } });
   }
   static getExternalId(id: number): Promise<IUserModel | null> {
      return users.findOne({ where: { externalId: id } });
   }
   static create(user: IUser): Promise<IUser> {
      return users.create(user);
   }
   static delete(id: number): Promise<Number> {
      return users.destroy({ where: { id: id } });
   }
}
