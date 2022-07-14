import { wallets,IWalletModel } from "../models";
import { IWallet } from "../interfaces";

export class Wallets {
   static async getAll(): Promise<IWalletModel[]> {
      return await wallets.findAll();
   }
   static async getById(id: number): Promise<IWalletModel | null> {
      return await wallets.findByPk(id);
   }
   static async getByUserId(userId: number): Promise<IWalletModel | null> {
      return await wallets.findOne({ where: { userId: userId } });
   }
   static async create(wallet: IWallet): Promise<IWalletModel> {
      return await wallets.create(wallet);
   }
   static async delete(id: number): Promise<Number> {
      return await wallets.destroy({ where: { id: id } });
   }
}





