module.exports = {
    apps: [
        {
            name: "Automatisation des rapports",
            cwd: "./",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production"
            }
        },
    ]
}