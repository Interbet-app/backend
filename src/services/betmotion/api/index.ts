import axios from "axios";

const BETMOTION_API_URL = process.env.BETMOTION_API_URL as string;

export default axios.create({
   baseURL: BETMOTION_API_URL,
   headers: {
      "Content-Type": "text/xml",
   },
   timeout: 10000,
});
