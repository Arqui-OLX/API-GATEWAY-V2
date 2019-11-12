const jwt = require('jsonwebtoken')
const APP_SECRET = 'ezibuy-secret'

function getEmail(context) {
  const Authorization = context.request.get('Authorization')
  if (Authorization) {
    try{
        const token = Authorization.replace('Bearer ', '')
        const { email } = jwt.verify(token, APP_SECRET)
        return email
    } catch(err) {
        return false
    }
  }

  return false
}

module.exports = {
  APP_SECRET,
  getEmail,
}