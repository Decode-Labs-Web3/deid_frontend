module.exports = {
  apps: [
    {
      name: 'deid-frontend',
      script: 'npm',
      args: 'run dev',
      // cwd will be set automatically by PM2 based on where you run the command
      // Or set it explicitly: cwd: process.env.HOME + '/deid_frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false, // Set to true if you want PM2 to restart on file changes
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      // For production, uncomment and use:
      // args: 'run start',
      // env: {
      //   NODE_ENV: 'production',
      //   PORT: 3000,
      // },
    },
  ],
};
