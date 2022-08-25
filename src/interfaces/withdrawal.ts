export interface IWithdrawal {
   id?: number;
   userId: number;
   amount: number;
   status: "pendent" | "completed";
   pixKey: string;
   pixKeyType: "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM";
   externalStatus?: string;
   externalId?: string;
   createdAt: Date;
   updatedAt: Date;
}


