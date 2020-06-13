//Express Import
import { Request, Response, NextFunction } from 'express';
//Json Web Tokens Import
import jwt from 'jsonwebtoken';

export default () => {
    return {
        verify: (req: Request, res: Response, next: NextFunction) => {
            //Get Auth Header Value
            const bearerHeader = req.headers['authorization'];

            if(typeof bearerHeader !== 'undefined') {
                //Split
                const bearer = bearerHeader.split(' ');
                //Get Token from Array
                const bearerToken = bearer[1]
                //Verify Token
                jwt.verify(bearerToken, 'secretkeyword', (err:any, tokenDecoded) => {
                    if(err){
                        return res.status(403).json({
                            ok: false,
                            msg: 'Lo sentimos, usted no tiene acceso. Favor de verificar su Token.'
                        })
                    }

                    req.body.authUser = tokenDecoded;
                    next();
                });
            }
            else{
                // Unauthorized
                return res.status(401).json({
                    ok: false,
                    msg: 'Lo sentimos, el acceso es restringido. Se requiere iniciar sesión para acceder.'
                });
            }

        }
    }
}