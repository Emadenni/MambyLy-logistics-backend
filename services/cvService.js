import AWS from "aws-sdk";
const S3 = new AWS.S3();
const bucketName = process.env.BUCKET_NAME;

const getFileExtension = (mimetype) => {
  switch (mimetype) {
    case "application/pdf":
      return "pdf";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    default:
      return "pdf";
  }
};

export const uploadCV = async (file, applicationId) => {
  const fileExtension = getFileExtension(file.mimetype);
  const fileName = `cv/${applicationId}.${fileExtension}`;

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  try {
    const data = await S3.upload(params).promise();
    return data.Location;
  } catch (error) {
    throw new Error("Error uploading CV: " + error.message);
  }
};

export const getCV = async (applicationId) => {
  const formats = ["pdf", "doc", "docx"];
  let fileUrl = "";

  for (const format of formats) {
    const params = {
      Bucket: bucketName,
      Key: `cv/${applicationId}.${format}`,
    };

    try {
      await S3.headObject(params).promise();
      fileUrl = `https://${bucketName}.s3.amazonaws.com/cv/${applicationId}.${format}`;
      break;
    } catch (error) {
      continue;
    }
  }

  if (!fileUrl) {
    throw new Error("CV not found for the application");
  }
  return fileUrl;
};

export const deleteCV = async (applicationId) => {
  const formats = ["pdf", "doc", "docx"];
  let deleted = false;

  for (const format of formats) {
    const params = {
      Bucket: bucketName,
      Key: `cv/${applicationId}.${format}`,
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
    return "CV deleted successfully";
  } else {
    throw new Error("CV not found to delete");
  }
};
