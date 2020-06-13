"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Json Web Tokens Import
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.default = () => {
    return {
        verify: (req, res, next) => {
            //Get Auth Header Value
            const bearerHeader = req.headers['authorization'];
            if (typeof bearerHeader !== 'undefined') {
                //Split
                const bearer = bearerHeader.split(' ');
                //Get Token from Array
                const bearerToken = bearer[1];
                //Verify Token
                jsonwebtoken_1.default.verify(bearerToken, 'secretkeyword', (err, tokenDecoded) => {
                    if (err) {
                        return res.status(403).json({
                            ok: false,
                            msg: 'Lo sentimos, usted no tiene acceso. Favor de verificar su Token.'
                        });
                    }
                    req.body.authUser = tokenDecoded;
                    next();
                });
            }
            else {
                // Unauthorized
                return res.status(401).json({
                    ok: false,
                    msg: 'Lo sentimos, el acceso es restringido. Se requiere iniciar sesión para acceder.'
                });
            }
        }
    };
};
