export function authenticate(req, res, next) {
    req.user = {id: 1};
    next();
}