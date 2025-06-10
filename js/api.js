

// Base URLs
const hostApi = "https://dev.learninghammer.com/mobileapp";
// const hostApi = "http://127.0.0.1:8000";

// API Endpoints
const endpoints = {
  login: "/user/login_page/",

  logout: "/user/logout_page/",
  tokenRefreshEndpoint: "/api/token/refresh/",

  qnaMeta:    "/community/qna/",   
  qnaSubmit:  "/community/qna/",    
};


// Function to get the access token
async function getAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    console.error("No refresh token found.");
    return null;
  }

  try {
    const response = await axios.post(
      `${hostApi}${endpoints.tokenRefreshEndpoint}`,
      { refresh: refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const accessToken = response.data.access;
    return accessToken;
  } catch (error) {
    console.error("Error fetching access token:", error.message);
    return null;
  }
}





export { getAccessToken, endpoints, hostApi };
