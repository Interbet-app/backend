var mercadopago = require("mercadopago");

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN as string;
mercadopago.configure({
   access_token: ACCESS_TOKEN,
   issuer_id: process.env.MP_ISSUER_ID as string,
});

export default mercadopago;
