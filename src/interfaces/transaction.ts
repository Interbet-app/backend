
export interface IBetTransaction {
    id?: number;
    userToken: string;
    betId: number;
    action: string;
    requestXml: string;
    responseXml: string;
    createdAt?: Date;
}