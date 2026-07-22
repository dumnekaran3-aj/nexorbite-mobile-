const ENV = {
  development: {
    API_URL: "http://<YOUR_LOCAL_IP>:3000",     // WSL/emulator ke liye localhost nahi, machine ka LAN IP daalo
    SOCKET_URL: "http://<YOUR_LOCAL_IP>:3000",
  },
  production: {
    API_URL: "https://<your-render-app>.onrender.com",
    SOCKET_URL: "https://<your-render-app>.onrender.com",
  },
};

export default __DEV__ ? ENV.development : ENV.production;