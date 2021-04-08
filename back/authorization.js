const jwt = require('jsonwebtoken')
const KEY_JWT = require('./index')

const authorization = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]
    console.log("token to authenticate : ", token)
    const decoded = jwt.verify(token, KEY_JWT)
    console.log("decoded token : ", decoded)
    req.userData = decoded
    next()
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: 'auth failed' })
  }
}

module.exports = authorization