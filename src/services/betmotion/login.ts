import Betmotion from "./api";
import logger from "../../log";

type ISignInResponse = {
   token: string | null;
};

export async function SignIn(token: string): Promise<ISignInResponse> {
   try {
      const res = await Betmotion.post(
         "/games/start.do",
         {
            id: 7164,
            mode: "REAL",
            platform: "DESKTOP",
            language: "BR",
         },
         {
            headers: {
               Authorization: `Bearer ${token}`,
               "Content-Type": "application/json",
            },
         }
      );

      return res.data;
   } catch (error) {
      logger.error("BetmotionSignIn ->" + error);
      return { token: null };
   }
}
