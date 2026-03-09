module.exports = {
    apps: [
        {
            name: 'isp',
            exec_mode: 'cluster',
            instances: 1, // Or a number of instances
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000, // Change this to your desired port
            },
        }
    ]
}