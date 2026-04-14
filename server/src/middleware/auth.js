export function authenticate(req, res, next) {
  req.user = { id: 8 }
  next()
}
