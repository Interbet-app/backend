import NodeCache from "node-cache";
export const Cache = new NodeCache({
   deleteOnExpire: true,
   checkperiod: 120,
});
