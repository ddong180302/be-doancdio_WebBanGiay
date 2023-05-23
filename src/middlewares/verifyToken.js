import jwt from 'jsonwebtoken'
const verifyToken = (req, res, next) => {

    let access_token = req.headers.authorization?.split(' ')[1]
    if (!access_token) return res.status(401).json({
        statusCode: 401,
        message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
        error: "Unauthorized"
    })

    jwt.verify(access_token, process.env.JWT_ACCESS_SECRET, (err, user) => {
        if (err) return res.status(401).json({
            statusCode: 401,
            message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
            error: "Unauthorized"
        })

        req.user = user
        next()
    })


}

export default verifyToken