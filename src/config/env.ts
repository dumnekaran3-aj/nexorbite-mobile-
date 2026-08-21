const ENV = {
  development: {
    API_URL: "http://192.168.1.16:3000",
    SOCKET_URL: "http://192.168.1.16:3000",
  },
  production: {
    API_URL: "https://backend-2xiu.onrender.com",
    SOCKET_URL: "https://backend-2xiu.onrender.com",
  },
};

export default __DEV__ ? ENV.development : ENV.production;
