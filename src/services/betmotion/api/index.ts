import axios from "axios";

const Betmotion = axios.create({
   baseURL: "https://api.betmotion.com",
   headers: {
      "Content-Type": "text/xml",
   },
});

export default Betmotion;
