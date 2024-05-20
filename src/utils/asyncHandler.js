import { app } from "../app"

// const ayncHandler = (fn) = async (req, res, next)=>{
//     try {
//         await fn(req, res, next)
        
//     } catch (error) {
//         res.status (error.code || 500).json(
//             {
//                 success : false,
//                 message : error.message
//             }
//         );
//     }
// }

const ayncHandler = (requestHandler) =>{
    (req, res, next)=>{
        Promise.resolve(
            requestHandler(req, res, next)
        ).reject((error)=>{
            next(error);
        })
    }
}