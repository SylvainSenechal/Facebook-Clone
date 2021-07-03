// todo : voir dockers
// todo : voir req.params vs req.query : https://stackoverflow.com/questions/35038857/setting-query-string-using-fetch-get-request
// todo : virer async de sqlite
// todo : voir comment gerer erreur avec requête db séparées
const express = require('express')
const sqlite3 = require('better-sqlite3') // https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md

const createDatabase = require('./database/dbCreation.js')
const messageRequests = require('./database/messageRequests.js')
const friendRequests = require('./database/friendRequests.js')
const databaseFile = new sqlite3('./database/facebook.db', { verbose: console.log })
const { authorization, authentication } = require('./authorization.js')

const port = process.env.PORT || 8080

const app = express()

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

app.use('/', authentication)

app.post('/friendRequest', authorization, async (req, res) => {
	const database = req.app.locals.database
	const idAsked = req.body.idAsked
	if (!idAsked) {
		return res.status(400).json({ message: 'Request error' })
	}
	friendRequests.addFriend(database, req.userData.userId, req.body.idAsked)
	res.status(201).json({ message: 'Friend request sent' })
})

app.get('/friendRequest', authorization, async (req, res) => {
	const database = req.app.locals.database
	const pendingFriendRequests = friendRequests.getPendingRequests(database, req.userData.userId)
	res.status(200).json({ friendsRequest: pendingFriendRequests })
})

app.post('/acceptRequest', authorization, async (req, res) => {
	const database = req.app.locals.database
	const idAsker = req.body.idAsker
	const idAsked = req.userData.userId
	if (!idAsker || !idAsked) {
		return res.status(400).json({ message: 'Request error' })
	}
	friendRequests.acceptFriendRequest(database, idAsker, idAsked)
	res.status(201).json({ message: 'friend added' })
})

app.get('/friends', authorization, async (req, res) => {
	const database = req.app.locals.database
	const friends = friendRequests.getFriends(database, req.userData.userId)
	return res.status(200).json({ friendsFound: friends })
})

app.get('/findFriends/:name', authorization, async (req, res) => {
	const database = req.app.locals.database
	const name = req.params.name
	if (!name) {
		return res.status(400).json({ message: 'Request error' })
	}
	foundPeople = friendRequests.searchPeople(database, req.userData.userId, name)
	return res.status(200).json({ foundPeople: foundPeople })
})

app.get('/posts', authorization, async (req, res) => {
	const database = req.app.locals.database
	const postsFound = messageRequests.getPosts(database, req.userData.userId)
	return res.status(200).json({ postsFound: postsFound })
})

app.post('/newPost', authorization, async (req, res) => {
	const database = req.app.locals.database
	const message = req.body.message
	if (!message) {
		return res.status(400).json({ message: 'Request error' })
	}
	messageRequests.postPost(database, req.userData.userId, message)
	res.status(201).json({ message: 'Post created' })
})

app.post('/likePost', authorization, async (req, res) => {
	const database = req.app.locals.database
	const postId = req.body.postId
	if (!postId) {
		return res.status(400).json({ message: 'Request error' })
	}
	messageRequests.likePost(database, req.userData.userId, postId)
	res.status(201).json({ message: 'Post liked' })
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