import { uploadProfileImg, deleteProfileImg } from "../../../services/ProfileImgService";
import { auth } from "../../../middlewares/auth";

export const updateProfileImgHandler = async (event) => {
  const adminId = event.pathParameters.adminId;

  const { base64Image, mimetype } = JSON.parse(event.body || "{}");

  if (!adminId || !base64Image || !mimetype) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required fields: adminId, base64Image, or mimetype" }),
    };
  }

  try {
    await deleteProfileImg(adminId);

    const imageUrl = await uploadProfileImg(base64Image, adminId, mimetype);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Profile image updated successfully", imageUrl }),
    };
  } catch (error) {
    console.error("Error updating profile image:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error updating profile image", error: error.message }),
    };
  }
};

export const handler = middy(updateProfileImgHandler).use(auth());
