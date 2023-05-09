import axios from "axios";
import { convertXMLtoJson } from "../../utils/xml";

interface XMLBody {
   userToken: string;
}

interface Response {
   token: string;
   currency: string;
   externalUserID: string;
   balance: string;
}

const xmlBody = ({ userToken }: XMLBody) => `<PKT>
<Method Name="GetBalance">
  <Auth Login="" Password="" />
  <Params>
    <Token Type="string" Value="${userToken}" />
    <ExternalUserID Type="string" Value="inter_bet" />
    <SiteId Type="string" Value="5" />
  </Params>
</Method>
</PKT>`;

export async function getBalance({ userToken }: XMLBody) {
   const endpoint = "https://bmapi-staging.salsaomni.com/api/inter-bet/handle.do";

   try {
      const response = await axios.post(
         endpoint,
         xmlBody({
            userToken,
         }),
         {
            headers: { "Content-Type": "text/xml" },
         }
      );

      const convertedXML = convertXMLtoJson(response.data, ["token", "balance", "currency", "externalUserID"]) as Response;

      return convertedXML;
   } catch (error) {
      console.log(error);
   }
}
