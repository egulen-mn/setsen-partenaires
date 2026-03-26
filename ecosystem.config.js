module.exports = {
  apps: [{
    name: 'b2b',
    script: 'npm',
    args: 'start',
    cwd: '/srv/apps/b2b',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3014,
      NEXT_PUBLIC_SITE_URL: 'https://b2b.tengerly.com'
    },
    error_file: '/srv/apps/b2b/logs/error.log',
    out_file: '/srv/apps/b2b/logs/out.log',
    log_file: '/srv/apps/b2b/logs/combined.log',
    time: true,
    node_args: ['--max-old-space-size=1024'],
    stop_exit_codes: [0, 1]
  }]
};
