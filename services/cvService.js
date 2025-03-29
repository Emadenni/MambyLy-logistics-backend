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

export const uploadJobCv = async (base64Cv, jobMessageId, mimetype) => {
  const base64Data = base64Cv.replace(/^data:application\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const fileExtension = getFileExtension(mimetype);
  const fileName = `job-cvs/${jobMessageId}.${fileExtension}`;

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentType: mimetype,
    ACL: "public-read",
  };

  try {
    const data = await S3.upload(params).promise();
    console.log("CV upload success:", data);
    return data.Location;
  } catch (error) {
    console.error("Error uploading job CV:", error);
    throw new Error("Error uploading job CV: " + error.message);
  }
};
