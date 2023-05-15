import Betmotion from "./api";
import { IPlaceBet, IBetWinner, IBetLoss, XmlPlaceBet, XmlBetLoss, XmlBetWinner } from "./templates";
import { convertXMLtoJson } from "../../utils/xml";
import logger from "../../log";

interface IPlaceBetResponse {
   token: string;
   balance: string;
   extTransactionID: string;
   alreadyProcessed: string;
}

export async function PlaceBet({ amount, betId, gameId, oddValue, userToken }: IPlaceBet) {
   const amountInCents = amount * 100;
   try {
      const response = await Betmotion.post(
         "/api/inter-bet/handle.do",
         XmlPlaceBet({ amount: amountInCents, userToken, betId, gameId, oddValue })
      );
      return convertXMLtoJson(response.data, ["token", "balance", "extTransactionID", "alreadyProcessed"]) as IPlaceBetResponse;
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
      logger.info("awardWinnings extract from xml ->" + JSON.stringify(convertedXML));
      return convertedXML;
   } catch (error) {
      logger.info("awardWinnings error ->" + error);
   }
}

