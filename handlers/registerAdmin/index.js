import { registerAdmin } from "../../services/adminServices";


export const registerAdminHandler = async (event) => {
  try {

    const adminData = JSON.parse(event.body);


    const admin = await registerAdmin(adminData);


    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Admin registered successfully",
        admin,  
      }),
    };
  } catch (error) {

    console.error("Error registering admin: ", error.message);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        message: error.message || "Internal server error",
      }),
    };
  }
};