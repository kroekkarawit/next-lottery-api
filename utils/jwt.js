const jwt = require('jsonwebtoken'); // Assuming you have jsonwebtoken installed

const publicKey = process.env.SECRET_KEY; // Example using environment variable

function verifyToken(req) {

    const accessToken = req.headers.authorization.split(' ')[1];

    if (!accessToken) {
        throw new Error('Authorization header missing or invalid format');
    }
    const decodedToken = jwt.decode(accessToken);

    if (!decodedToken) {
        throw new Error('Invalid token format');
    }
    try {
        jwt.verify(accessToken, publicKey);
    } catch (err) {
        throw new Error('Invalid token signature');
    }
    return decodedToken; // Return the decoded (and verified) payload
}

module.exports = verifyToken; // Export the verifyToken function
