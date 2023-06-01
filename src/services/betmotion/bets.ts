import Betmotion from "./api";
import { IPlaceBet, IBetWinner, IBetLoss, XmlRefundBet, XmlPlaceBet, XmlBetLoss, XmlBetWinner, XmlNewCredit, XmlNewDebit } from "./templates";
import { convertXMLtoJson } from "../../utils/xml";
import logger from "../../log";

interface IPlaceBetResponse {
   token: string;
   balance: string;
   extTransactionID: string;
   alreadyProcessed: string;
   Success: string;
}

export async function PlaceBet({ amount, betId, gameId, oddValue, userToken }: IPlaceBet) {
   const amountInCents = amount * 100;
   try {
      const response = await Betmotion.post(
         "/api/inter-bet/handle.do",
         XmlPlaceBet({ amount: amountInCents, userToken, betId, gameId, oddValue })
      );
      return convertXMLtoJson(response.data, ["token", "balance", "extTransactionID", "alreadyProcessed", "Success"]) as IPlaceBetResponse;
   } catch (error) {
      logger.error("BetmotionPlaceBet ->" + error);
   }
}

export async function BetLoss(betId: number, userToken: string, gameName: string) {
   try {
      const response = await Betmotion.post("/api/inter-bet/handle.do", XmlBetLoss({ userToken, betId, gameName }));
      logger.info("lossSignal response ->" + JSON.stringify(response.data));
   } catch (error) {
      logger.info("lossSignal error ->" + error);
   }
}

export async function BetWinner(betId: number, userToken: string, amount: number, gameName: string) {
   try {
      const response = await Betmotion.post("/api/inter-bet/handle.do", XmlBetWinner({ userToken, betId, amount, gameName }));
      logger.info("awardWinnings response ->" + JSON.stringify(response.data));
      const convertedXML = convertXMLtoJson(response.data, ["token", "balance", "extTransactionID", "alreadyProcessed"]) as Response;
      return convertedXML;
   } catch (error) {
      logger.info("awardWinnings error ->" + error);
   }
}

export async function Refound(betId: number, userToken: string, amount: number, gameName: string) {
   try {
      const response = await Betmotion.post("/api/inter-bet/handle.do", XmlRefundBet({ userToken, betId, amount, gameName }));

      logger.info("refound response ->" + JSON.stringify(response.data));
   } catch (error) {
      logger.info("refound error ->" + error);
   }
}
export async function NewCredit(betId: number, userToken: string, amount: number) {
   try {
      console.log(XmlNewCredit({ userToken, betId, amount }))
      const response = await Betmotion.post("/api/inter-bet/handle.do", XmlNewCredit({ userToken, betId, amount }));
      console.log(response)
      logger.info("newCredit response ->" + JSON.stringify(response.data));
   } catch (error) {
      logger.info("newCredit error ->" + error);
   }
}
export async function NewDebit(betId: number, userToken: string, amount: number) {
   try {
      console.log(XmlNewDebit({ userToken, betId, amount }))
      const response = await Betmotion.post("/api/inter-bet/handle.do", XmlNewDebit({ userToken, betId, amount }));
      logger.info("NewDebit response ->" + JSON.stringify(response.data));
   } catch (error) {
      logger.info("NewDebit error ->" + error);
   }
}
