module.exports = {
  apps: [
    {
      name: 'thecapitalfeed',
      cwd: '/var/www/thecapitalfeed',
      script: '.next/standalone/server.js',
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        HOSTNAME: '127.0.0.1',
      },
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
}
