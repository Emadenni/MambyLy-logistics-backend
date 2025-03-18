const successResponse = (data) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Success",
      data: data,
    }),
  };
};

const errorResponse = (message, statusCode = 500) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify({
      message: message,
      error: message,
    }),
  };
};

module.exports = {
  successResponse,
  errorResponse,
};
