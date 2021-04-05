const express = require('express')
const app = express()
const port = process.env.PORT || 8080
// const dbPassword = process.env.DB_PASSWORD
// const dbName = process.env.DB_NAME
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

console.log(port)
app.use(express.json())
app.listen(port)

app.use((req, res, next) => {
    console.log(req.method)
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
        return res.status(401).json({message: 'auth failed'})
    }
}

app.post('/register', async (req, res) => {
    console.log(req.body)
    bcrypt.hash(req.body.password, 10, async (err, hashed) => {
        if (err) {
            return res.status(500).json({error: err})
        } else {
            const user = {
                pseudo: req.body.pseudo,
                password: hashed
            }
            // const db = req.app.locals.database
            // await db.collection('Users').insertOne(user)
            res.status(201).json({
                message: 'user created'
            })
        }
    })
})

// app.post('/login', async (req, res) => {
//     const db = req.app.locals.database
//     const user = await db.collection('Users').findOne({email: req.body.email})
//     if (!user) {
//         return res.status(401).json({message: 'auth failed'})
//     }
//     console.log(user)
//     bcrypt.compare(req.body.password, user.password, (err, result) => {
//         if (err) {
//             return res.status(401).json({message: 'auth failed'})
//         } 
//         if (result === true) {
//             const token = jwt.sign({
//                 email: user.email, 
//                 userId: user._id
//             },
//             KEY_JWT,
//             {
//                 expiresIn: "1h"
//             }
//             )
//             return res.status(200).json({message: 'auth successfull', token: token})
//         } else {
//             return res.status(401).json({message: 'auth failed'})
//         }
//     })
// })

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