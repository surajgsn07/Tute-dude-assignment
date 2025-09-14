const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

// Configure Cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
    api_key: process.env.CLOUDINARY_API_KEY ,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (localFilepath) => {
    try {
        if (!localFilepath) return null;

        const response = await cloudinary.uploader.upload(localFilepath, {
            resource_type: "video",
            folder: "interviews",
        });

        if (fs.existsSync(localFilepath)) fs.unlinkSync(localFilepath); // remove local file
        return response;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        if (fs.existsSync(localFilepath)) fs.unlinkSync(localFilepath);
        return null;
    }
};

// Delete file from Cloudinary using publicId
const deleteFromCloudinary = async (publicId) => {
    try {
        const res = await cloudinary.uploader.destroy(String(publicId));
        return res;
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
        return null;
    }
};

// Extract publicId from Cloudinary URL
const getPublicId = (url) => {
    try {
        const arr = url.split("/");
        const item = arr[arr.length - 1];
        const arr2 = item.split(".");
        return arr2[0];
    } catch (error) {
        console.error("Cloudinary Get PublicId Error:", error);
        return null;
    }
};


const getUploadSignature = (folder = "interviews") => {
  const timestamp = Math.floor(Date.now() / 1000);

  // Params to sign must match the ones you'll send from frontend
  const paramsToSign = {
    timestamp,
    folder, // optional, but if added here MUST also be sent in FormData
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  };
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    getPublicId,
    getUploadSignature
};
