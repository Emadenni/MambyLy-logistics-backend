import { registerAdmin } from "../../services/adminServices";

export const handler = async (event) => {
  try {
    const { firstName, lastName, email, password, profileImage } = JSON.parse(event.body);

    const adminData = {
      firstName,
      lastName,
      email,
      password,
      profileImage,
    };

    const result = await registerAdmin(adminData); 

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Super admin registered successfully", data: result }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error registering super admin", error: error.message }),
    };
  }
};
