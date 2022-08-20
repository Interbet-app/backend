export interface IWallet {
   id?: number;
   userId: number;
   balance: number;
   bonus: number;
   score: number;
   createdAt: Date;
   updatedAt: Date;
}
