import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // console.log("File uploaded", response.url)
        // console.log("Cloudy response",response)
        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteImageFromCloudinary = async (publicId) => {
  try {
    await cloudinary.api
      .delete_resources(publicId)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.log(`Error 1 while deleting files ${error}`);
        return null;
      });
  } catch (error) {
    console.log(`Error 2 while deleting files ${error}`);
    return null;
  }
};

export {uploadOnCloudinary, deleteImageFromCloudinary}