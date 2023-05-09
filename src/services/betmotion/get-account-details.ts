import axios from "axios";
import { checkStatusOfRequest, convertXMLtoJson } from "../../utils/xml";
import AppError from "../../error";

interface XMLBody {
   token: string;
}

interface Response {
   token: string;
   loginName: string;
   currency: string;
   country: string;
   externalUserType: string;
   externalUserID: string;
   affiliationPath: string;
}

const xmlBody = ({ token }: XMLBody) => `<PKT>
<Method Name="GetAccountDetails">
  <Auth Login="" Password="" />
  <Params>
    <Token Type="string" Value="${token}" />
    <SiteId Type="string" Value="5" />
  </Params>
</Method>
</PKT>`;

export async function getAccountDetails({ token }: XMLBody) {
   const endpoint = "https://bmapi-staging.salsaomni.com/api/inter-bet/handle.do";

   try {
      const response = await axios.post(
         endpoint,
         xmlBody({
            token,
         }),
         {
            headers: { "Content-Type": "text/xml" },
         }
      );

      if (!checkStatusOfRequest(response.data).ok) {
         return null;
      }

      const convertedXML = convertXMLtoJson(response.data, [
         "token",
         "loginName",
         "currency",
         "externalUserID",
         "externalUserType",
         "country",
         "affiliationPath",
      ]) as Response;

      return convertedXML;
   } catch (error) {
      console.log(error);
   }
}
