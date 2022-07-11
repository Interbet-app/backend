import { wallets } from "../models";
import { IWallet } from "../interfaces";

export class Wallets {
   static async getAll(): Promise<IWallet[]> {
      return await wallets.findAll();
   }
   static async getById(id: number): Promise<IWallet | null> {
      return await wallets.findByPk(id);
   }
   static async getByUserId(userId: number): Promise<IWallet | null> {
      return await wallets.findOne({ where: { userId: userId } });
   }
   static async create(wallet: IWallet): Promise<IWallet> {
      return await wallets.create(wallet);
   }
   static async update(wallet: IWallet): Promise<[number]> {
      return await wallets.update(wallet, { where: { id: wallet.id } });
   }
   static async delete(id: number): Promise<Number> {
      return await wallets.destroy({ where: { id: id } });
   }
}
