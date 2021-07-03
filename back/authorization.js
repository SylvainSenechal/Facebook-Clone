//todo : refresh le refresh token ?

const express = require('express')
const bcrypt = require('bcrypt') // https://www.martinstoeckli.ch/hash/en/index.php
const WORK_FACTOR_BCRYPT = 12
const jwt = require('jsonwebtoken')
const KEY_JWT = "badObviousTestKey"
const KEY_JWT_REFRESH = "ohohoho"

const authentication = express.Router()

const TOKEN_LIFESPAN = "30sec"
const TOKEN_REFRESH_LIFESPAN = "3600sec"

const authorization = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1]
      const decoded = jwt.verify(token, KEY_JWT)
      console.log("decoded token : ", decoded)
      req.userData = decoded
      next()
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized ressource access' })
    }
  } else {
    return res.status(401).json({ message: 'Unauthorized ressource access' })
  }
}

authentication.post('/register', async (req, res) => {
	const pseudo = req.body.pseudo
	const password = req.body.password
	if (!pseudo || !password) {
		return res.status(400).json({
			message: 'Request error'
		})
	}
	const database = req.app.locals.database
	const statementUserExist = database.prepare("SELECT pseudo FROM user WHERE pseudo = ?")
	const foundUser = statementUserExist.get(pseudo)
	if (foundUser) {
		res.status(200).json({
			message: 'User already exists'
		})
	} else {
		try {
			const hashPassword = await bcrypt.hash(password, WORK_FACTOR_BCRYPT)
			const createUser = database.prepare("INSERT INTO user (pseudo, password) VALUES (?, ?)")
			createUser.run(pseudo, hashPassword)
			res.status(201).json({
				message: 'User created'
			})
		} catch (error) {
			console.log(error)
			return res.status(500).json({ error: error })
		}
	}
})

authentication.post('/login', async (req, res) => {
	const pseudo = req.body.pseudo
	const password = req.body.password
	if (!pseudo || !password) {
		return res.status(400).json({
			message: 'Request error'
		})
	}
	const database = req.app.locals.database
	const statement = database.prepare("SELECT user_id, pseudo, password FROM user WHERE pseudo = ?")
	const user = statement.get(pseudo)

	if (!user) {
		return res.status(401).json({ message: 'Authentication failed' })
	}

	try {
		const match = await bcrypt.compare(password, user.password)
		if (match === true) {
			const token = jwt.sign({
				userId: user.user_id,
				pseudo: user.pseudo,
			},
				KEY_JWT,
				{
					expiresIn: TOKEN_LIFESPAN
				}
			)
			const refreshToken = jwt.sign({
				userId: user.user_id,
				pseudo: user.pseudo,
			},
				KEY_JWT_REFRESH,
				{
					expiresIn: TOKEN_REFRESH_LIFESPAN
				}
			)
			return res.status(200).json({ message: 'Authentication successful', token: token, refreshToken: refreshToken })
		} else {
			return res.status(401).json({ message: 'Authentication failed' })
		}
	} catch (error) {
		return res.status(401).json({ message: 'Authentication failed' })
	}
})

authentication.get('/newToken/:refreshToken', (req, res) => {
	const refreshToken = req.params.refreshToken
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, KEY_JWT_REFRESH)
			const newToken = jwt.sign({
				userId: decoded.userId,
				pseudo: decoded.pseudo,
			},
				KEY_JWT,
				{
					expiresIn: TOKEN_LIFESPAN
				}
			)
      res.status(200).json({ newToken: newToken })
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized ressource access' })
    }
  } else {
    return res.status(401).json({ message: 'Unauthorized ressource access' })
  }
})

module.exports = {
  authorization,
  authentication
}