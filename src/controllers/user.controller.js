import {ayncHandler} from "../utils/asyncHandler.js"

const registerUser = ayncHandler( async (req, res)=>{
    res.status(200).json({
        message : "Ok"
    })
})

export {registerUser}