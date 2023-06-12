import Betmotion from "./api";
import { IPlaceBet, XmlRefundBet, XmlPlaceBet, XmlBetLoss, XmlBetWinner, XmlNewCredit, XmlNewDebit, XmlCashOutBet } from "./templates";
import { convertXMLtoJson } from "../../utils/xml";
import { BetmotionTransactions } from "../../models";
import logger from "../../log";

interface IPlaceBetResponse {
   token: string;
   balance: string;
   extTransactionID: string;
   alreadyProcessed: string;
   Success: string;
}

export async function PlaceBet({ amount, betId, gameId, oddValue, userToken }: IPlaceBet) {
   try {
      const requestXml = XmlPlaceBet({ amount, userToken, betId, gameId, oddValue });
      const response = await Betmotion.post("/api/inter-bet/handle.do", requestXml);

     await BetmotionTransactions.create({
        userToken,
        betId,
        action: "PlaceBet",
        requestXml: requestXml,
        responseXml: response.data,
     });

      return convertXMLtoJson(response.data, ["token", "balance", "extTransactionID", "alreadyProcessed", "Success"]) as IPlaceBetResponse;
   } catch (error) {
      logger.error("BetmotionPlaceBet ->" + error);
   }
}
export async function BetLoss(betId: number, userToken: string, gameName: string) {
   try {
      const requestXml = XmlBetLoss({ userToken, betId, gameName });
      const response = await Betmotion.post("/api/inter-bet/handle.do", requestXml);

     await BetmotionTransactions.create({
        userToken,
        betId,
        action: "LossSignal",
        requestXml: requestXml,
        responseXml: response.data,
     });
   } catch (error) {
      logger.info("lossSignal error ->" + error);
   }
}
export async function BetWinner(betId: number, userToken: string, amount: number, gameName: string) {
   try {
      const requestXml = XmlBetWinner({ userToken, betId, amount, gameName });
      const response = await Betmotion.post("/api/inter-bet/handle.do", requestXml);

     await BetmotionTransactions.create({
         userToken,
         betId,
         action: "AwardWinnings",
         requestXml: requestXml,
         responseXml: response.data,
      });

      return convertXMLtoJson(response.data, ["token", "balance", "extTransactionID", "alreadyProcessed"]) as Response;
   } catch (error) {
      logger.info("awardWinnings error ->" + error);
   }
}
export async function Refound(betId: number, userToken: string, amount: number, gameName: string) {
   try {
      const requestXml = XmlRefundBet({ userToken, betId, amount, gameName });
      const response = await Betmotion.post("/api/inter-bet/handle.do", requestXml);
     
     await BetmotionTransactions.create({
        userToken,
        betId,
        action: "Refund",
        requestXml: requestXml,
        responseXml: response.data,
     });
   } catch (error) {
      logger.info("refound error ->" + error);
   }
}
export async function NewCredit(betId: number, userToken: string, amount: number) {
   try {
      const requestXml = XmlNewCredit({ userToken, betId, amount });
      const response = await Betmotion.post("/api/inter-bet/handle.do", requestXml);

     await BetmotionTransactions.create({
        userToken,
        betId,
        action: "newCredit",
        requestXml: requestXml,
        responseXml: response.data,
     });
   } catch (error) {
      logger.info("NewCredit error ->" + error);
   }
}
export async function NewDebit(betId: number, userToken: string, amount: number) {
   try {
      const requestXml = XmlNewDebit({ userToken, betId, amount });
      const response = await Betmotion.post("/api/inter-bet/handle.do", requestXml);

    await BetmotionTransactions.create({
       userToken,
       betId,
       action: "NewDebit",
       requestXml: requestXml,
       responseXml: response.data,
    });
   } catch (error) {
      logger.info("NewDebit error ->" + error);
   }
}
export async function CashOutBet(betId: number, userToken: string, amount: number) {
   try {
      const requestXml = XmlCashOutBet({ userToken, betId, amount });
      const response = await Betmotion.post("/api/inter-bet/handle.do", requestXml);

    await BetmotionTransactions.create({
       userToken,
       betId,
       action: "CashOut",
       requestXml: requestXml,
       responseXml: response.data,
    });
   } catch (error) {
      logger.info("CashOut error ->" + error);
   }
}
