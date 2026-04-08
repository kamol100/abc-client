module.exports = {
    apps: [
        {
            name: 'isp',
            cwd: __dirname,
            exec_mode: 'cluster',
            instances: 1,
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
        }
    ]
}