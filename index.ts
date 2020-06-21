// Express Import
import express, { response } from 'express';
import { Request, Response } from 'express';

//JSON Web Token Import
import jwt from 'jsonwebtoken';

//BcryptJS Import
import bcrypt from 'bcryptjs'; 

// CORS Import
import cors from 'cors';

//Token Middleware Import
import auth_token from './middlewares/token.middleware';

//MongoDB Helper Import
import MongoDBHelper from './helpers/mongodb.helper';

//Environments Import
import ENV from './environments/env.productions';
import MongoDB from './helpers/mongodb.helper';

// Constants Declarations
const app = express();
const token = auth_token();
const mongoDB = MongoDBHelper.getInstance(ENV.MONGODB);

// Middlewares for API
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middlewares for CORS
app.use(cors({ origin: true, credentials: true }));

app.get('/api/auth/test', (req: Request, res: Response) => {
    res.status(200).json({
        ok: true,
        msg: 'Método Test Ejecutandose Correctamente.'
    });
});

app.post('/api/auth/login', async(req: Request, res: Response) => {
    const { userName, password } = req.body;

    const user = await mongoDB.db.collection('users').findOne({ email: userName });

    if(user){
        if (!bcrypt.compareSync(password, user.password)) {
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
    
        jwt.sign(userValid, 'secretkeyword', { expiresIn: '120s' }, ( err: any, token ) => {
    
            if (err){
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

    } else {
        return res.status(404).json({
            ok: false,
            msg: 'Lo sentimos, el usuario y contraseña proporcionados no son validos. Favor de verificar.'
        });
    }

});

app.post('/api/auth/createUser', async(req: Request, res:Response) => {

    const { email, password, fullName, urlPhoto, rol } = req.body;

    const user = await mongoDB.db.collection('users').findOne({ email: email});

    if(user){
        return res.status(403).json({
            ok: false,
            msg: 'Usuario ya registrado. Por favor introduzca información valida.'
        });  
    }
    else {
        const newUser = {
            email, password: bcrypt.hashSync(password, 10), fullName, urlPhoto, rol
        }
    
        const insert = await mongoDB.db.collection('users').insertOne(newUser);
    
        return res.status(200).json({
            ok: true,
            msg: 'Usuario creado correctamente.',
            result: insert.insertedId
        });
    }

});

app.post('/api/auth/deleteUser', async(req: Request, res: Response) => {
    const { email } = req.body;

    const user = await mongoDB.db.collection('users').deleteOne({email: email});

    return res.status(200).json({
        ok: true,
        msg: 'Usuario eliminado correctamente.'
    });
});

app.get('/api/auth/verifyToken', token.verify, async(req: Request, res: Response) => {
    const { authUser } = req.body;

    return res.status(200).json({
        ok: true,
        msg: 'Token verificado.'
    });
});

app.get('/api/auth/getUsers', token.verify, async(req: Request, res:Response) => {
    const { authUser } = req.body

    const users = await mongoDB.db.collection('users').find({}).toArray();

    const userlist = [];

    for(var i=0; i< users.length; i++){
        if(users[i].rol != 'ADMIN'){
            userlist.push(users[i]);
        }
    }

    return res.status(200).json({
        ok: true,
        msg: 'Lista de usuarios recolectada correctamente.',
        collection: userlist
    });
});

app.listen(ENV.API.PORT, async() => {
    console.log(`Servidor de APIs funcionando correctamente en el puerto ${ENV.API.PORT}`);
    // Connect to MongoDB
    await mongoDB.connect();
});

// Handle Errors
process.on('unhandledRejection', async(err:any) => {
    //Close MongoDB Connection
    mongoDB.close();
    process.exit();
});