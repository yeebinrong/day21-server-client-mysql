// load libraries
const express = require('express')
const morgan = require('morgan')
const mysql = require('mysql2/promise')
const cors = require('cors')
const bodyParser = require('body-parser')
let secureEnv = require('secure-env');

// create an instance of express
const app = express()

// declare variables
global.env = secureEnv({secret: process.env.ENV_PASSWORD});
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

// create pool
const pool = mysql.createPool({
    host: global.env.SQL_HOST,
    port: global.env.SQL_PORT,
    user: global.env.SQL_USER,
    password: global.env.SQL_PASS,
    database: global.env.SQL_SCHEMA,
    connectionLimit: global.env.SQL_CON_LIMIT
})

// cors for browser cors bypass
app.use(cors())

// parse data
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.json({limit: '50mb'}))

// morgan for logging
app.use(morgan("combined"))

// SQL QUERIES
const SELECT_ALL = 'SELECT * FROM rsvp'
const INSERT_NEW = `INSERT INTO rsvp (name, email, phone, status, createdBy, createdDt) values (?,?,?,?,?,CURDATE())`

const mkQuery = (sqlStmt, pool) => {
    return async (params) => {
        // get a connection from pool
        const conn = await pool.getConnection()
        try {
            // Execute the query with the parameter
            const results = await conn.query(sqlStmt, params)
            return results[0]
        } catch (e) {
            return Promise.reject(e)            
        } finally {
            conn.release()
        }
    }
}

const SELECT_ALL_QUERY = mkQuery(SELECT_ALL, pool)
const INSERT_NEW_QUERY = mkQuery(INSERT_NEW, pool)

// app.use(express.static(`${__dirname}/client/src`))

app.get('/api/rsvp', async (req, resp) => {
    const results = await SELECT_ALL_QUERY();
    resp.status(200)
    resp.type('application/json')
    resp.json(results)
})

app.post('/api/rsvp', async (req, resp) => {
    //name, email, phone, status, createdBy, createdDt
    const b = req.body
    console.info(b.name)
    await INSERT_NEW_QUERY([b.name, b.email, b.phone, b.status, b.createdBy, b.createdDt])
    resp.status(200)
    resp.type('application/json')
    resp.json({})
})

// initalise the app
const startApp = async (app, pool) => {
    try {
        // get connection from db
        const conn = await pool.getConnection()
        console.info('Pinging database...')
        await conn.ping()

        //release connection
        conn.release()
        console.info('Successfully pinged database...')
        // listen for port
        app.listen(PORT, () => {
            console.info(`Application is listening to PORT ${PORT} at ${new Date()}.`)
        })
    } 
    catch (e) {
        console.error("Error pinging database! ", e)
    }
}

startApp(app, pool)