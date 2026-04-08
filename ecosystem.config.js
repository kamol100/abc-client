const path = require("path");

module.exports = {
  apps: [
    {
      name: "isp",
      cwd: path.join(__dirname, "current"),
      exec_mode: "cluster",
      instances: Number(process.env.PM2_INSTANCES || 1),
      listen_timeout: 10000,
      kill_timeout: 5000,
      wait_ready: false,
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};