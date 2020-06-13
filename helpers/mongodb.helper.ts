//MongoDB Import
import { MongoClient } from 'mongodb';
//Environment Import
import ENV from '../environments/env.productions';

export default class MongoDB{
    public db:any;

    private cnn: any;
    private port: number;
    private dbUri: string;
    private static _instance: MongoDB;

    constructor(SETTINGS: any){
        this.port = SETTINGS.PORT;
        this.dbUri = `mongodb://${SETTINGS.USER_NAME}:${SETTINGS.USER_PASSWORD}@${SETTINGS.HOST}/${SETTINGS.DEFAULT_DATABASE}`;
    }

    public static getInstance(settings: any){
        return this._instance || (this._instance = new this(settings));
    }

    async connect() {
        MongoClient.connect(this.dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(connection => {
            this.cnn = connection;
            this.db = this.cnn.db();

            console.log('Conexión a MongoDB realizada de forma correcta.')
        })
        .catch((err:any) => {
            console.log(`Ocurrio un error al intentar conectarse a la base de datos de MongoDB. La descripción del error es la siguiente: `, err);
        })
    }

    setDatabase(dbName: string) {
        this.db = this.cnn.db(dbName);
    }

    async close() {
        await this.cnn.close();
    }
}