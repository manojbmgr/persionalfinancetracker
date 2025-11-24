const { getTokenFromRequest, getTokenFromCookie, verifyToken } = require('./auth');

function authenticateRequest(req) {
  const token = getTokenFromRequest(req) || getTokenFromCookie(req);

  if (!token) {
    return { error: 'Access token required', status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: 'Invalid or expired token', status: 403 };
  }

  return { user: decoded };
}

module.exports = { authenticateRequest };

