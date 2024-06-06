import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiHandler.js";


cloudinary.config({ 
    cloud_name: 'dx6vyybhl', 
    api_key: '591547875439276', 
    api_secret: 'LzHd7DgDIc9bEt6k5LYWRxNCm6M'
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath)  throw new ApiError(400, "Local Image Not Found")

        
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) 
        throw new ApiError(400, "Network Issue");
    }
}



export {uploadOnCloudinary}