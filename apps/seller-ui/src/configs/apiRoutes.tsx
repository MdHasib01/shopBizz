export const apiConfig = {
  baseUrl: "http://localhost:8080",
  routes: {
    signup: `/api/seller-registration`,
    verifyOtp: `/api/verify-seller`,
    createShop: `/api/create-shop`,
    login: `/api/login`,
    forgotPassword: `/api/forgot-password`,
    verifyForgotPasswordOtp: `/api/verify-forgot-password`,
    resetPassword: `/api/reset-password`,
    refreshToken: `/api/refresh-token-user`,
    getUser: `/api/loggedin-user`,
  },
};
