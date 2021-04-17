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
      return res.status(401).json({ message: 'Unauthorized ressource access' })
    }
  } else {
    return res.status(401).json({ message: 'Unauthorized ressource access' })
  }
}

module.exports = authorization