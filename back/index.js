// todo : prepared statement fichier separe
// todo : persistence login, refresh token
// todo : voir dockers

const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt') // https://www.martinstoeckli.ch/hash/en/index.php
const sqlite3 = require('better-sqlite3') // https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md
const KEY_JWT = "badObviousTestKey"
module.exports = KEY_JWT
const authorization = require('./authorization')
const createDatabase = require('./dbCreation.js')

const WORK_FACTOR_BCRYPT = 12

const port = process.env.PORT || 8080
// const dbPassword = process.env.DB_PASSWORD
// const dbName = process.env.DB_NAME

const app = express()
const databaseFile = new sqlite3('facebook.db', { verbose: console.log })
app.locals.database = databaseFile

createDatabase(databaseFile)

app.use(express.json())
app.listen(port)
console.log('Listening on : ', port)

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-type, Authorization')
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
		return res.status(200).json({})
	}
	next()
})

app.use((req, res, next) => {
	console.log('LOGGER')
	next()
})

app.post('/register', async (req, res) => {
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

app.post('/login', async (req, res) => {
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
					expiresIn: "1min"
				}
			)
			return res.status(200).json({ message: 'Authentication successful', token: token })
		} else {
			return res.status(401).json({ message: 'Authentication failed' })
		}
	} catch (error) {
		return res.status(401).json({ message: 'Authentication failed' })
	}
})

app.post('/friendRequest', authorization, async (req, res) => {
	const idAsked = req.body.idAsked
	if (!idAsked) {
		return res.status(400).json({
			message: 'Request error'
		})
	}
	const database = req.app.locals.database
	const statementFindPseudo = database.prepare("SELECT pseudo FROM user WHERE user_id = ?")
	const pseudoAsked = statementFindPseudo.get(idAsked)
	const statement = database.prepare("INSERT INTO friend_request (id_asker, id_asked, pseudo_asker, pseudo_asked) VALUES (?, ?, ?, ?)")
	statement.run(req.userData.userId, req.body.idAsked, req.userData.pseudo, pseudoAsked.pseudo)

	res.status(201).json({
		message: 'Friend request sent'
	})
})

app.get('/friendRequest', authorization, async (req, res) => {
	const database = req.app.locals.database
	const statement = database.prepare("SELECT id_asker, pseudo_asker FROM friend_request WHERE id_asked = ?")
	const result = statement.all(req.userData.userId)
	let asking = []
	for (let ask of result) {
		asking.push({ idAsker: ask.id_asker, pseudoAsker: ask.pseudo_asker })
	}

	res.status(200).json({ friendsRequest: asking })
})

app.post('/acceptRequest', authorization, async (req, res) => {
	const idAsker = req.body.idAsker
	const idAsked = req.userData.userId
	if (!idAsker || !idAsked) {
		return res.status(400).json({
			message: 'Request error'
		})
	}
	const database = req.app.locals.database
	const statement = database.prepare("SELECT pseudo_asker, pseudo_asked FROM friend_request WHERE id_asker = ? AND id_asked = ?")
	const friendRequest = statement.get(idAsker, idAsked)
	const addFriend = database.prepare("INSERT INTO friendship (id_friend1, id_friend2, pseudo_friend1, pseudo_friend2) VALUES (?, ?, ?, ?)")
	const removeFriendRequest = database.prepare("DELETE FROM friend_request WHERE id_asker = ? AND id_asked = ?")
	try {
		addFriend.run(idAsker, idAsked, friendRequest.pseudo_asker, friendRequest.pseudo_asked)
		removeFriendRequest.run(idAsker, idAsked)
		removeFriendRequest.run(idAsked, idAsker)
	} catch (error) {
		console.log('Error friendship insertion')
		return res.status(401).json({
			message: 'Error on friendship insertion'
		})
	}

	res.status(201).json({
		message: 'friend added'
	})
})

app.get('/friends', authorization, async (req, res) => {
	const database = req.app.locals.database
	const f1 = database.prepare("SELECT rowid, id_friend2 as id_friend, pseudo_friend2 as pseudo FROM friendship WHERE id_friend1 = ?")
	const f2 = database.prepare("SELECT rowid, id_friend1 as id_friend, pseudo_friend1 as pseudo FROM friendship WHERE id_friend2 = ?")
	let r1 = f1.all(req.userData.userId)
	let r2 = f2.all(req.userData.userId)
	let friends = []
	for (let friend of r1) {
		friends.push({ id: friend.id_friend, pseudo: friend.pseudo })
	}
	for (let friend of r2) {
		friends.push({ id: friend.id_friend, pseudo: friend.pseudo })
	}
	return res.status(200).json({ friendsFound: friends })
})

app.get('/findFriends/:name', authorization, async (req, res) => {
	const name = req.params.name
	if (!name) {
		return res.status(400).json({
			message: 'Request error'
		})
	}
	const database = req.app.locals.database
	const findPeople = database.prepare(`
		SELECT user_id, pseudo
		FROM user
		WHERE pseudo LIKE ?
		AND user_id != ?`)

	const foundPeople = findPeople.all(`%${name}%`, req.userData.userId)
	let persons = []
	for (let people of foundPeople) {
		persons.push({ id: people.user_id, pseudo: people.pseudo })
	}

	return res.status(200).json({ friendsFound: persons })
})

app.get('/posts', authorization, async (req, res) => {
	const database = req.app.locals.database
	const postsQuery = database.prepare(`
		SELECT DISTINCT id_post, id_poster, pseudo_poster, content, nb_likes 
		FROM posts, friendship 
		WHERE id_poster = friendship.id_friend1 AND ? = friendship.id_friend2
		OR id_poster = friendship.id_friend2 AND ? = friendship.id_friend1
		OR id_poster = ?
	`)
	const posts = postsQuery.all(req.userData.userId, req.userData.userId, req.userData.userId)
	const postsProcessed = []
	for (let post of posts) {
		postsProcessed.push({
			idPost: post.id_post,
			id_poster: post.id_poster,
			pseudo: post.pseudo_poster,
			content: post.content,
			nb_likes: post.nb_likes
		})
	}

	return res.status(200).json({ postsFound: postsProcessed })
})

app.post('/newPost', authorization, async (req, res) => {
	console.log('request sent by :', req.userData)
	const message = req.body.message
	if (!message) {
		return res.status(400).json({
			message: 'Request error'
		})
	}
	const database = req.app.locals.database
	const insertMessage = database.prepare("INSERT INTO posts (id_poster, pseudo_poster, content, nb_likes) VALUES (?, ?, ?, ?)")
	insertMessage.run(req.userData.userId, req.userData.pseudo, message, 0)
	res.status(201).json({
		message: 'Post created'
	})
})

app.post('/likePost', authorization, async (req, res) => {
	console.log('request sent by :', req.userData)
	const postId = req.body.postId
	if (!postId) {
		return res.status(400).json({
			message: 'Request error'
		})
	}
	const database = req.app.locals.database
	const likePost = database.prepare("UPDATE posts SET nb_likes = nb_likes + 1 WHERE id_post = ?")
	likePost.run(postId)
	res.status(201).json({
		message: 'Post liked'
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
