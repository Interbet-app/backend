import axios from "axios";
import { convertXMLtoJson } from "../utils/xml";

interface XMLBody {
   userToken: string;
   transactionId: number;
   winReferenceNum: string;
}

interface Response {
   token: string;
   balance: string;
   extTransactionID: string;
   alreadyProcessed: string;
}

const xmlBody = ({ userToken, transactionId, winReferenceNum }: XMLBody) => `<PKT>
<Method Name="AwardWinnings">
  <Auth Login="" Password="" />
  <Params>
    <Token Type="string" Value="${userToken}" />
    <TransactionID Type="int" Value="${transactionId}" />
    <WinAmount Type="int" Value="3000" />
    <WinReferenceNum Type="string" Value="${winReferenceNum}" />
    <GameReference Type="string" Value="INTER_BET_GAMES" />
    <BetMode Type="string" Value="Live" />
    <Description Type="string" Value="Live bet (Multiple)" />
    <ExternalUserID Type="string" Value="asdasd" />
    <FrontendType Type="int" Value="4" />
    <BetStatus Type="string" Value="S" />
    <SportIDs Type="string" Value="1" />
  </Params>
</Method>
</PKT>`;

export async function awardWinnings({ userToken, winReferenceNum }: Omit<XMLBody, "transactionId">) {
   const endpoint = "https://bmapi-staging.salsaomni.com/api/inter-bet/handle.do";

   try {
      const response = await axios.post(
         endpoint,
         xmlBody({
            userToken,
            transactionId: new Date().valueOf(),
            winReferenceNum,
         }),
         {
            headers: { "Content-Type": "text/xml" },
         }
      );

      const convertedXML = convertXMLtoJson(response.data, ["token", "balance", "extTransactionID", "alreadyProcessed"]) as Response;

      return convertedXML;
   } catch (error) {
      console.log(error);
   }
}

