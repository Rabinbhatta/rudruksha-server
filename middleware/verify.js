import jwt from "jsonwebtoken"
export  const  jwt_verify = (req, res, next)=>{
    try {
        const token = req.token
        const userId = jwt.verify(token,process.env.JWT_KEY);
       if(userId){
        res.userId = userId
        next()}
    } catch (error) {
        res.clearCookie("token")
    }
}