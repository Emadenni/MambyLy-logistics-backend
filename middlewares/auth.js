import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";

const auth = () => {
    return {
        before: async (request) => {
            const { event } = request;
            const admin = event.requestContext?.authorizer?.principalId; 

            if (!admin) {
                throw new Error ("Unauthorized");
            }

            request.event.adminId = admin;
        }
    };
};

export default auth;