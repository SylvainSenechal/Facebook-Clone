const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const KEY_JWT = "badObviousTestKey"
// const dbPassword = process.env.DB_PASSWORD
// const dbName = process.env.DB_NAME
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt') // https://www.martinstoeckli.ch/hash/en/index.php
const sqlite3 = require('better-sqlite3')

// const database = new sqlite3(':memory:', { verbose: console.log })
const databaseFile = new sqlite3('facebook.db', { verbose: console.log })
app.locals.database = databaseFile

const createDatabase = require('./dbCreation.js')

createDatabase(databaseFile)

app.use(express.json())
app.listen(port)
console.log('Listening on : ', port)

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-type')
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
		return res.status(200).json({})
	}
	next()
})

const checkAuth = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1]
		console.log(token)
		const decoded = jwt.verify(token, KEY_JWT)
		console.log(decoded)
		req.userData = decoded
		next()
	} catch (error) {
		console.log(error)
		return res.status(401).json({ message: 'auth failed' })
	}
}
// todo prepared statement fichier separe
// todo	tester sql injections ' union SELECT name, password FROM users WHERE name <> '
// tester différent work factor sur bcrypt
app.post('/register', async (req, res) => {
	console.log(req.body)
	// verifier pseudo not exists
	bcrypt.hash(req.body.password, 10, async (err, hashed) => {
		if (err) {
			return res.status(500).json({ error: err })
		} else {
			const database = req.app.locals.database
			const statement = database.prepare("INSERT INTO user (pseudo, password) VALUES (?, ?)")
			statement.run(req.body.pseudo, hashed)
			const statement4 = database.prepare("SELECT user_id, rowid, * FROM user")
			console.log(statement4.all())
			res.status(201).json({
				message: 'user created'
			})
		}
	})
})

app.post('/login', async (req, res) => {
	const database = req.app.locals.database
	console.log(req.body)
	const statement = database.prepare("SELECT pseudo, password FROM user WHERE pseudo = ?")
	const user = statement.get(req.body.pseudo)

	console.log(user)

	if (!user) {
		return res.status(401).json({ message: 'auth failed' })
	}
	bcrypt.compare(req.body.password, user.password, (err, result) => {
		console.log(err)
		console.log(result)
		if (err) {
			return res.status(401).json({ message: 'auth failed' })
		}
		if (result === true) {
			const token = jwt.sign({
				email: user.email,
				userId: user._id
			},
				KEY_JWT,
				{
					expiresIn: "1h"
				}
			)
			return res.status(200).json({ message: 'successfull', token: token })
		} else {
			return res.status(401).json({ message: 'auth failed' })
		}
	})
})

app.use((req, res, next) => {
	const error = new Error('Not found')
	error.status = 404
	next(error)
})

app.use((error, req, res, next) => {
	res.status(error.status || 500)
	res.json({
		error: {
			message: error.message,
			error: error
		}
	})
})