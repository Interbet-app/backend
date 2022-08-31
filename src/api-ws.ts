import WebSocket from "ws";
import logger from "./log";

export class WsSocket {
   public wss: any;

   constructor(server: any) {
      this.wss = new WebSocket.Server({ server });
      this.broadcast = this.broadcast.bind(this);
      this.direct = this.direct.bind(this);
      this.onMessage = this.onMessage.bind(this);
      this.onError = this.onError.bind(this);
      logger.info(`Web Socket Server iniciado com sucesso!`);
   }

   public onError(error: Error) {
      logger.error(error);
   }
   public onMessage(message: any) {
      logger.info(message);
   }
   public broadcast(json: object) {
      this.wss.clients.forEach((client: any) => {
         if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(json));
         }
      });
   }
   public direct(userId: number, data: object) {
      this.wss.clients.forEach((client: any) => {
         if (client.readyState === WebSocket.OPEN && client.id === userId) {
            client.send(JSON.stringify(data));
         }
      });
   }
}


