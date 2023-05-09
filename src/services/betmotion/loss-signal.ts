import axios from "axios";
import logger from "../../log";

interface XMLBody {
   userToken: string;
   transactionId: number;
   betId: number;
   gameName: string;
}

interface Response {
   token: string;
   balance: string;
   extTransactionID: string;
   alreadyProcessed: string;
}

const xmlBody = ({ userToken, transactionId, betId, gameName }: XMLBody) => `<PKT>
<Method Name="LossSignal">
  <Auth Login="" Password="" />
  <Params>
    <Token Type="string" Value="${userToken}" />
      <TransactionID Type="int" Value="${transactionId}" />
      <BetAmount Type="int" Value="0" />
      <BetReferenceNum Type="string" Value="${betId}" />
      <GameReference Type="string" Value="${gameName}" />
      <BetMode Type="string" Value="Live" />
      <Description Type="string" Value="${gameName}" />
      <ExternalUserID Type="string" Value="ABC123456" />
      <FrontendType Type="int" Value="2" />
      <BetStatus Type="string" Value="N" />
      <SportIDs Type="string" Value="1" />
      <SiteId Type="string" Value="5" />
      </Params>
</Method>
</PKT>`;

export async function lossSignal(betId: number, userId: string, gameName: string) {
   const endpoint = "https://bmapi-staging.salsaomni.com/api/inter-bet/handle.do";
   try {
      const xml = xmlBody({
         userToken: userId + "-inter_bet_game-1680806812759",
         transactionId: new Date().valueOf(),
         betId,
         gameName,
      });

      const response = await axios.post(endpoint, xml, {
         headers: { "Content-Type": "text/xml" },
      });

      logger.info("lossSignal xml send->" + xml);
      logger.info("lossSignal response ->" + JSON.stringify(response.data));
   } catch (error) {
      logger.info("lossSignal error ->" + error);
   }
}
