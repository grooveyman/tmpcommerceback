const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('./asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
    let refreshtoken = req.cookies.refreshToken;
    //get access token through bearer token header
    let accesstoken;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    
    if(authHeader && authHeader.startsWith('Bearer')){
        accesstoken = authHeader.split(" ")[1];
        
        if(!accesstoken){
            return res.status(401).json({status:false, message:'Access token not provided'});
        }
    }

    //verify refresh token
    let refreshuserid;
    if(refreshtoken && accesstoken){
        //check for refresh token expiry
        try{
            const refreshDecoded = jwt.verify(refreshtoken, process.env.SECRET_REFRESH);
            refreshuserid = refreshDecoded.userId;

        }catch(err){
            if(err.name === 'TokenExpiredError'){
                return res.status(401).json({status:false, message:'Refresh Token expired'});
            }
            return res.status(401).json({status:false, message:err.message});
        }

        //check for access token expiry
        try{            
            const accessdecoded = jwt.verify(accesstoken, process.env.SECRET_ACCESS);
            // return res.json({refresh:refreshuserid, access:accessdecoded.userId});
            if(refreshuserid !== accessdecoded.userId){
                return res.status(401).json({status:false, message:'Invalid token'});
            }

            req.user = await User.findById(accessdecoded.userId).select('-password');
            next();
        }catch(error){
            if(error.name === 'TokenExpiredError'){
                return res.status(401).json({status:false, message:'Access Token expired'});
            }
            return res.status(401).json({status:false, message:error.message});
        }

        
    }else{
        return res.status(401).json({status:false, message:'Not authorized, no token provided'});
    }
});

//check if user is admin
const authorizeAdmin = (req, res, next) => {
    try{

        if(req.user && req.user.isAdmin){
            next()
        }else{
            return res.status(401).json({status:false, message:'Not authorized as an admin'});
        }
    }catch(error){
        return res.status(401).json({status:false, message:error.message});
    }
    
};

module.exports = {authenticate, authorizeAdmin};