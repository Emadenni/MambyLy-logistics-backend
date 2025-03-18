import AWS from "aws-sdk";

const S3 = new AWS.S3();
const bucketName = process.env.BUCKET_NAME;

const getFileExtension = (mimetype) => {
  switch (mimetype) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
};

export const uploadProfileImg = async (base64Image, adminId, mimetype) => {
  const buffer = Buffer.from(base64Image, 'base64');
  const fileExtension = getFileExtension(mimetype);
  const fileName = `profile-images/${adminId}.${fileExtension}`;

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentType: mimetype,
    ACL: "public-read",
  };

  try {
    const data = await S3.upload(params).promise();
    console.log("Upload success:", data);  
    return data.Location;
  } catch (error) {
    console.error("Error details:", error);  
    throw new Error("Error uploading profile image: " + error.message);
  }
};

export const deleteProfileImg = async (adminId) => {
  const formats = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
  let deleted = false;

  for (const format of formats) {
    const params = {
      Bucket: bucketName,
      Key: `profile-images/${adminId}.${format}`,
    };
    try {
      await S3.deleteObject(params).promise();
      deleted = true;
      break;
    } catch (error) {
      continue;
    }
  }

  if (deleted) {
    return "Profile image deleted successfully";
  } else {
    throw new Error("Profile image not found to delete");
  }
};


export const getProfileImg = async (adminId) => {
  const formats = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
  let imageUrl = "";

  for (const format of formats) {
    const params = {
      Bucket: bucketName,
      Key: `profile-images/${adminId}.${format}`,
    };

    try {
      await S3.headObject(params).promise();
      imageUrl = `https://${bucketName}.s3.amazonaws.com/profile-images/${adminId}.${format}`;
      break;
    } catch (error) {
      continue;
    }
  }

  if (!imageUrl) {
    imageUrl = `https://${bucketName}.s3.amazonaws.com/default-profile.jpg`;  
  }
  return imageUrl;
};