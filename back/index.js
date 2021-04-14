const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const KEY_JWT = "badObviousTestKey"
module.exports = KEY_JWT
const authorization = require('./authorization')
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
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-type, Authorization')
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
		return res.status(200).json({})
	}
	next()
})

// todo prepared statement fichier separe
// todo	tester sql injections ' union SELECT name, password FROM users WHERE name <> ' + sanitize les inputs ?
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
	const statement = database.prepare("SELECT user_id, pseudo, password FROM user WHERE pseudo = ?")
	const user = statement.get(req.body.pseudo)

	console.log('found user in database :\n', user)

	if (!user) {
		return res.status(401).json({ message: 'auth failed' })
	}
	bcrypt.compare(req.body.password, user.password, (err, result) => {
		console.log('error  bcrypt :', err)
		console.log('result bcrypt :', result)
		if (err) {
			return res.status(401).json({ message: 'auth failed' })
		}
		if (result === true) {
			const token = jwt.sign({
				userId: user.user_id,
				pseudo: user.pseudo,
			},
				KEY_JWT,
				{
					expiresIn: "1min"
				}
			)
			console.log(token)
			return res.status(200).json({ message: 'successfull', token: token })
		} else {
			return res.status(401).json({ message: 'auth failed' })
		}
	})
})

app.post('/friendRequest', authorization, async (req, res) => {
	console.log(req.body)
	const database = req.app.locals.database
	const s1 = database.prepare("SELECT pseudo FROM user WHERE user_id = ?")
	const pseudoAsker = s1.get(req.body.idAsker)
	const pseudoAsked = s1.get(req.body.idAsked)
	const statement = database.prepare("INSERT INTO friend_request (id_asker, id_asked, pseudo_asker, pseudo_asked) VALUES (?, ?, ?, ?)")
	console.log(req.body.idAsker, req.body.idAsked, pseudoAsker, pseudoAsked)
	statement.run(req.body.idAsker, req.body.idAsked, pseudoAsker.pseudo, pseudoAsked.pseudo)

	res.status(201).json({
		message: 'friend request sent'
	})
})

app.get('/friendRequest/:id', authorization, async (req, res) => {
	console.log(req.body)
	const user = req.params.id
	const database = req.app.locals.database
	const statement = database.prepare("SELECT id_asker, pseudo_asker FROM friend_request WHERE id_asked = ?")
	const result = statement.all(user)
	console.log(result)
	let asking = []
	for (let ask of result) {
		asking.push({ idAsker: ask.id_asker, pseudoAsker: ask.pseudo_asker })
	}
	
	res.status(200).json({ friendsRequest: asking })
})

app.post('/acceptRequest', authorization, async (req, res) => {
	console.log(req.body)
	// todo destroy the friend request, check the friend request both ways
	const database = req.app.locals.database
	const statement = database.prepare("SELECT pseudo_asker, pseudo_asked FROM friend_request WHERE id_asker = ? AND id_asked = ?")
	const friendRequest = statement.get(req.body.idAsker, req.body.idAsked)
	console.log(friendRequest)
	const addFriend = database.prepare("INSERT INTO friendship (id_friend1, id_friend2, pseudo_friend1, pseudo_friend2) VALUES (?, ?, ?, ?)")
  addFriend.run(req.body.idAsker, req.body.idAsked, friendRequest.pseudo_asker, friendRequest.pseudo_asked)

	res.status(201).json({
		message: 'friend added'
	})
})

app.get('/friends/:id', authorization, async (req, res) => {
	console.log('request sent by :', req.userData)
	const user = req.params.id
	const database = req.app.locals.database
	console.log('getting friends of userId :', user)
	const f1 = database.prepare("SELECT rowid, id_friend2 as id_friend, pseudo_friend2 as pseudo FROM friendship WHERE id_friend1 = ?")
	console.log(f1.all(user))
	const f2 = database.prepare("SELECT rowid, id_friend1 as id_friend, pseudo_friend1 as pseudo FROM friendship WHERE id_friend2 = ?")
	console.log(f2.all(user))
	let r1 = f1.all(user)
	let r2 = f2.all(user)
	let friends = []
	console.log(r1.length)
	console.log(r2.length)
	for (let friend of r1) {
		friends.push({ id: friend.id_friend, pseudo: friend.pseudo })
	}
	for (let friend of r2) {
		friends.push({ id: friend.id_friend, pseudo: friend.pseudo })
	}
	return res.status(200).json({ friendsFound: friends })
})

app.get('/findFriends/:name', authorization, async (req, res) => {
	console.log('request sent by :', req.userData)
	const name = req.params.name
	const database = req.app.locals.database
	console.log('Getting list of person with name like :', name)
	console.log(name)
	console.log(req.userData)
	console.log(typeof name)

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

app.get('/posts/:id', authorization, async (req, res) => {
	console.log('request sent by :', req.userData)
	const user = req.params.id
	const database = req.app.locals.database
	const postsQuery = database.prepare(`
		SELECT DISTINCT id_post, id_poster, pseudo_poster, content, nb_likes 
		FROM posts, friendship 
		WHERE id_poster = friendship.id_friend1 AND ? = friendship.id_friend2
		OR id_poster = friendship.id_friend2 AND ? = friendship.id_friend1
		OR id_poster = ?
	`)
	const posts = postsQuery.all(user, user, user)
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
	const database = req.app.locals.database
	const messageSent = req.body.message
	const insertMessage = database.prepare("INSERT INTO posts (id_poster, pseudo_poster, content, nb_likes) VALUES (?, ?, ?, ?)")
	insertMessage.run(req.userData.userId, req.userData.pseudo, messageSent, 0)
	res.status(201).json({
		message: 'Post created'
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
