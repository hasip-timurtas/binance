const Hapi = require('hapi')

// Create a server with a host and port
const server = new Hapi.Server({ port: 3005, host: 'localhost' })

server.route({
    method: 'GET',
    path: '/helloworld',
    handler: function (request, reply) {
        return reply('hello world')
    }
})

// Add the route
server.route({
    method: 'GET',
    path: '/users',
    handler: function (request, reply) {

        connection.query('SELECT uid, username FROM users', function (error, results, fields) {
            if (error) throw error
            console.log(results)
            reply(results)
        })

    }
})

server.route({
    method: 'GET',
    path: '/user/{uid}',
    handler: function (request, reply) {
        const uid = request.params.uid

        connection.query('SELECT uid, username, email FROM users WHERE uid = "' + uid + '"', function (error, results, fields) {
            if (error) throw error
            console.log(results)
            reply(results)
        })

    }
})

server.route({
    method: 'POST',
    path: '/signup',

    handler: function (request, reply) {

        const username = request.payload.username
        const email = request.payload.email
        const password = request.payload.password

        connection.query('INSERT INTO users (username,email,password) VALUES ("' + username + '","' + email + '","' + encryptedPassword + '")', function (error, results, fields) {
            if (error) throw error
            console.log(results)
            reply(results)
        })

    }
})


server.route({
    method: 'POST',
    path: '/sendMessage',
    handler: function (request, reply) {

        const uid = request.payload.uid
        const message = request.payload.message

        connection.query('INSERT INTO messages (message,uid_fk) VALUES ("' + message + '","' + uid + '")', function (error, results, fields) {
            if (error) throw error
            console.log(results)
            reply(results)
        })

    }
})

server.route({
    method: 'POST',
    path: '/messages',

    handler: function (request, reply) {

        const uid = request.payload.uid
        console.log(uid)

        connection.query('SELECT * FROM messages WHERE uid_fk = "' + uid + '"', function (error, results, fields) {
            if (error) throw error
            console.log(results)
            reply(results)
        })

    }
})

server.route({
    method: 'DELETE',
    path: '/message/{uid}/{mid}',
    handler: function (request, reply) {
        const uid = request.params.uid
        const mid = request.params.mid

        console.log(uid + '---' + mid)

        connection.query('DELETE FROM messages WHERE uid_fk = "' + uid + '"AND mid = "' + mid + '"', function (error, result, fields) {
            if (error) throw error

            if (result.affectedRows) {
                reply(true)
            } else {
                reply(false)
            }

        })
    }
})


// Start the server
server.start((err) => {

    if (err) {
        throw err
    }
    console.log('Server running at:', server.info.uri)
})

