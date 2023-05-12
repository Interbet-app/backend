import axios from "axios";

const Betmotion = axios.create({
   baseURL: "https://bmapi-staging.salsaomni.com",
   headers: {
      "Content-Type": "text/xml",
   },
});

export default Betmotion;
