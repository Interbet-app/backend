import { users } from "../models";
import { IUser } from "../interfaces";

export class Users {
   static getById(id: number): Promise<IUser | null> {
      return users.findByPk(id);
   }
   static getByEmail(email: string): Promise<IUser | null> {
      return users.findOne({ where: { email } });
   }
   static getExternalId(id: number): Promise<IUser | null> {
      return users.findOne({ where: { externalId: id } });
   }
   static create(user: IUser): Promise<IUser> {
      return users.create(user);
   }
   static update(user: IUser): Promise<[number]> {
      return users.update(user, { where: { id: user.id } });
   }
   static delete(id: number): Promise<Number> {
      return users.destroy({ where: { id: id } });
   }
}
