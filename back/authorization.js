const jwt = require('jsonwebtoken')
const KEY_JWT = require('./index')

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
      console.log("error verifying token : ", error)
      return res.status(401).json({ message: 'auth failed' })
    }
  } else {
    console.log("no auth header found")
    return res.status(401).json({ message: 'auth failed' })
  }
}

module.exports = authorization