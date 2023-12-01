const server = require('./bin/www/app')

require('dotenv').config()

server.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is currently running on port: ${process.env.SERVER_PORT}`)
})