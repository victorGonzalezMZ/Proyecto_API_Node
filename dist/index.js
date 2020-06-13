"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Express Import
const express_1 = __importDefault(require("express"));
//JSON Web Token Import
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
//BcryptJS Import
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// CORS Import
const cors_1 = __importDefault(require("cors"));
//Token Middleware Import
const token_middleware_1 = __importDefault(require("./middlewares/token.middleware"));
//MongoDB Helper Import
const mongodb_helper_1 = __importDefault(require("./helpers/mongodb.helper"));
//Environments Import
const env_productions_1 = __importDefault(require("./environments/env.productions"));
// Constants Declarations
const app = express_1.default();
const token = token_middleware_1.default();
const mongoDB = mongodb_helper_1.default.getInstance(env_productions_1.default.MONGODB);
// Middlewares for API
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// Middlewares for CORS
app.use(cors_1.default({ origin: true, credentials: true }));
app.get('/api/auth/test', (req, res) => {
    res.status(200).json({
        ok: true,
        msg: 'Método Test Ejecutandose Correctamente.'
    });
});
app.post('/api/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, password } = req.body;
    const user = yield mongoDB.db.collection('users').findOne({ email: userName });
    if (user) {
        if (!bcryptjs_1.default.compareSync(password, user.password)) {
            return res.status(403).json({
                ok: false,
                msg: 'Lo sentimos, el usuario y contraseña proporcionados no son validos. Favor de verificar.'
            });
        }
        const userValid = {
            email: user.email,
            fullName: user.fullName,
            urlPhoto: user.urlPhoto,
            rol: user.rol
        };
        console.log(userValid);
        jsonwebtoken_1.default.sign(userValid, 'secretkeyword', { expiresIn: '120s' }, (err, token) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Ocurrion un error no contemplado',
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                msg: 'Usuario autenticado correctamente.',
                payload: {
                    userName: userValid.email,
                    roles: userValid.rol
                },
                token
            });
        });
    }
    else {
        return res.status(404).json({
            ok: false,
            msg: 'Lo sentimos, el usuario y contraseña proporcionados no son validos. Favor de verificar.'
        });
    }
}));
app.post('/api/auth/createUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, fullName, urlPhoto, rol } = req.body;
    const user = yield mongoDB.db.collection('users').findOne({ email: email, fullName: fullName });
    if (user) {
        return res.status(403).json({
            ok: false,
            msg: 'Usuario ya existe en la base de datos. Por favor introduzca información valida.'
        });
    }
    else {
        const newUser = {
            email, password: bcryptjs_1.default.hashSync(password, 10), fullName, urlPhoto, rol
        };
        const insert = yield mongoDB.db.collection('users').insertOne(newUser);
        return res.status(200).json({
            ok: true,
            msg: 'Usuario creado correctamente.',
            result: insert.insertedId
        });
    }
}));
app.listen(env_productions_1.default.API.PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Servidor de APIs funcionando correctamente en el puerto ${env_productions_1.default.API.PORT}`);
    // Connect to MongoDB
    yield mongoDB.connect();
}));
// Handle Errors
process.on('unhandledRejection', (err) => __awaiter(void 0, void 0, void 0, function* () {
    //Close MongoDB Connection
    mongoDB.close();
    process.exit();
}));
