import express, { Request } from 'express';
import { ConnectionClosedEvent } from 'mongodb';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import bodyParser from 'body-parser';
import pdf from 'pdf-parse';
import jwt from 'jsonwebtoken';
import { Summary, User } from './models.js';
import { MongoHandler } from "./mongo.js";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { MongoClient, Collection, Db } from 'mongodb';
// const pdf2text = require('pdf-to-text');
// const axios = require('axios');
// const vimeo = require('vimeo-upload-client');


async function callingFlask(data: any): Promise<any[]> {
    const flaskApi = 'http://127.0.0.1:5000';
    const url = '/api/v1/machinelearning';
    const response = await fetch(`${flaskApi}/${url}`, {
        method: "POST",
        body: data
    })
    const res = await response.json();
    return res;
}


export class Api {
    private _mongo: MongoHandler;
    private _jwtPk: string | undefined;

    private _nativeMongoClient: MongoClient;
    private _nativeMongoDb: Db;
    private _nativeMongoCollection: Collection;

    constructor(mongoUri: string | undefined, jwtPk: string | undefined) {
        let mgClient = new MongoClient(<string>mongoUri);
        let db = 'test';
        let collection = 'summaries';

        mgClient.connect();

        let mgDb = mgClient.db(db);
        let mgCollection = mgDb.collection(collection);

        console.log(mgCollection);
        console.log(mgDb);

        this._nativeMongoClient = mgClient;
        this._nativeMongoDb = mgDb;
        this._nativeMongoCollection = mgCollection;

        this._mongo = new MongoHandler(mongoUri);
        this._jwtPk = jwtPk;

        this._mongo.init();
    }


    /**
     *  Initializes the API routes
     * @returns {express.Router} The router for the api
     */
    init(): express.Router {
        let router = express.Router();

        router.get('/', (req, res) => {
            res.json({ message: 'hooray! welcome to our api!' });
        })

        /**
         * Method for initiating a new summarization request
         * 
         * POST body:
         * ```json
         * {
         * "userId": string, **temporary**
         * "type": string,
         * "data": string | File,
         * }
         * ```
         */
        router.post('/api/v1/summary/new', async (req: any, res: any) => {
            if (req.body == null) {
                console.log('sending here');
                res.status(400).send(JSON.stringify('Bad request.'));
            }

            console.log("Body: ", req.body);

            const { title, userId, files } = req.body;

            //@ts-ignore
            // const summaries: any[] = await callingFlask(files);
            const summaries = [{ raw: "butterfly", type: 'pdf', page: 2, id: '1234', url: "https://res.cloudinary.com/dlk3ezbal/image/upload/v1677408827/cramberry/muofg1xcckrqweherqhh.pdf" }, { raw: "butterfly", raw: 'pdf', page: 1, id: '1234', url: "https://res.cloudinary.com/dlk3ezbal/image/upload/v1677408827/cramberry/muofg1xcckrqweherqhh.pdf" }, { raw: "butterfly", raw: 'pdf', page: 3, id: '1234', url: "https://res.cloudinary.com/dlk3ezbal/image/upload/v1677408827/cramberry/muofg1xcckrqweherqhh.pdf" }, { raw: "butterfly", raw: 'pdf', page: 1, id: '1234', url: "https://res.cloudinary.com/dlk3ezbal/image/upload/v1677408827/cramberry/muofg1xcckrqweherqhh.pdf" }, { raw: "butterflyv", raw: 'video', start: 5, id: '1234', url: "https://res.cloudinary.com/dlk3ezbal/video/upload/v1677407694/cramberry/yjtq56cqf9gharq60lfi.mov" }]
            //create a new summary on user by pushing the summaryObject to the user's summaries array. add an index to the summaryObject
            //create a new summary on the summary collection
            //return the summaryObject
            console.log(res.userId)
            this._mongo.users().findById(userId, async (err: any, user: any) => {
                console.log("User: ", user);

                if (err) {
                    res.status(500).send(JSON.stringify('Internal server error.'));
                    return;
                }


                let summary = await this._mongo.summaries().create(
                    <Summary>{
                        title: title,
                        summaries: summaries,
                        id: this.randomStringToHash24Bits(title),
                    }
                )

                res.status(200).send(JSON.stringify(summary.id));
            })
        })


        /**
         * Route for fething a summary
         * GET param:
         * ```json
         * {
         * "id": string
         * }
         * ```
         */
        router.get('/api/v1/summary/:id', async (req, res) => {
            if (req.params.id === null) {
                res.status(400).send(JSON.stringify('Bad request.'));
            }

            let i;
            let summaries = (await this._nativeMongoCollection.find({}).toArray()).map((summary: any) => {
                if (summary.id === req.params.id) {
                    i = summary;

                    res.status(200).json(summary);
                    return;
                }
            })

            return;
        })

        router.get('/api/v1/summaries', async (req: any, res: any) => {
            let newA;
            let summaries = await this._nativeMongoCollection.find({}).toArray()

            console.log(summaries)

            res.status(200).json(summaries);
            return;
        })

        return (router);
    }

    private handleNewSummaryRequest(req: any) {

    }

    private handleGetSummaryRequest(req: any) {

    }

    private handleNewUserRequest(req: any) {

    }

    private handleLoginUserRequest(req: any) {

    }

    private randomStringToHash24Bits(inputString: string) {
        return crypto.createHash('sha256').update(inputString).digest('hex').substring(0, 24);
    }

    private isLoggedIn = (req: any, res: any, next: any) => {
        let token = req.headers["x-access'cramberry-auth-token"];

        //check if token exists or is null in an if statement
        if (!token || token === "" || token === undefined || token === null || token === "null") {
            return res.status(401).send(JSON.stringify("not logged in"));
        } else {
            try {
                let decoded: any = jwt.verify(token, <string>this._jwtPk);

                let user = this._mongo.users().findById(decoded, (err: any, user: any) => {
                    if (err) {
                        res.status(500).send(JSON.stringify('Internal server error.'));
                    }
                })

                if (!user) {
                    return res.status(401).send(JSON.stringify("no user found"));
                }
                console.log('setting ' + decoded._id + ' as user id');
                res.userId = decoded._id;
            } catch (e) {
                return res.status(500).send(JSON.stringify("internal server error"));
            }
        }
        next();
    };

    /**
     * Starts the API server
     * 
     * @returns {void}
     * @memberof API
     */
    start() {
        let app = express();
        app.use(cors());
        app.use(cookieParser());
        app.use(bodyParser.json(), bodyParser.urlencoded({ extended: false }))

        app.use(this.init());
        app.listen(3000, () => {
            console.log('✅ API listening on port 3000!');
        })
    }
}