declare namespace Express {
   interface Request {
      user: {
         id: number | undefined;
         motionId: string
      };
   }
}

// declare global {
//     namespace Express {
//         interface Request{
//             user: { ... }
//         }
//     }
// }

