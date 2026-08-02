const ENV = {
  development: {
    API_URL: "https://backend-2xiu.onrender.com",
    SOCKET_URL: "https://backend-2xiu.onrender.com",
  },
  production: {
    API_URL: "https://backend-2xiu.onrender.com",
    SOCKET_URL: "https://backend-2xiu.onrender.com",
  },
};

export default __DEV__ ? ENV.development : ENV.production;