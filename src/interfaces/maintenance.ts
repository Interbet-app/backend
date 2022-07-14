export interface IMaintenance {
   id: number;
   userId: number;
   path: string;
   method: "ALL" | "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
   group: string;
   createdAt: string;
   updatedAt: string;
}

