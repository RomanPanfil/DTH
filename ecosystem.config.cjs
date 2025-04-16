module.exports = {
    apps: [
        {
            name: 'dth',
            port: '3214',
            instances: 1,
            script: './.output/server/index.mjs'
        }
    ]
}