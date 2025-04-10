import jwt from 'jsonwebtoken';

const generateRefreshToken = (res, userId) => {
    const token = jwt.sign({userId}, process.env.SECRET_REFRESH, {
        expiresIn: process.env.SECRET_REFRESH_EXPIRY,});

        //set JWT as an HTTP only cookie
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: parseInt(process.env.REFRESH_COOK_EXPIRY, 10) * 60 * 1000 // 7 days
        })

        return token;
}

const generateAccessToken = (res, userId) => {
    return jwt.sign({userId}, process.env.SECRET_ACCESS, { expiresIn: process.env.SECRET_ACCESS_EXPIRY,});
}

export {generateRefreshToken, generateAccessToken};