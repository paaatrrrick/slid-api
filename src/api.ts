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

let upload = multer({ dest: 'uploads/' })

export class Api {
    private _mongo: MongoHandler;
    private _jwtPk: string | undefined;

    constructor(mongoUri: string | undefined, jwtPk: string | undefined) {
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
        router.post('/api/v1/summary/new', this.isLoggedIn, upload.array('file'), (req: any, res: any) => {
            if (req.body == null) {
                console.log('sending here');
                res.status(400).send(JSON.stringify('Bad request.'));
            }

            const endIndSuffixs = ["mov", "mp4", "pdf", "MOV", "MP4", "PDF"];


            console.log('req.body', req.body);
            console.log()
            console.log('req.files', req.files);
            console.log('req.files.length', req.files.length);
            console.log('req.files[0]', req.files[0]);
            for (let file of req.files) {
                console.log(file);
                console.log(file.mimetype);
                let fileExt: string = file.name.split('.').pop();
                if (endIndSuffixs.includes(fileExt)) {
                    if (fileExt === "PDF") {
                        fileExt = "pdf";
                    } else if (fileExt === "MOV") {
                        fileExt = "mov";
                    } else if (fileExt === "MP4") {
                        fileExt = "mp4";
                    }
                    switch (fileExt) {
                        case "mov":
                            console.log('bottom');
                            // make llm request
                            // save to db
                            this._mongo.users().findById(req.body.userId, (err: any, user: any) => {
                                if (err) {
                                    res.status(500).send(JSON.stringify('Internal server error.'));
                                    return
                                }

                                if (user === null) {
                                    res.status(404).send(JSON.stringify('User not found.'));
                                    return
                                }

                                let summary = this._mongo.summaries().create(
                                    {
                                        rawContent: file,
                                        summedContent: [],
                                        type: "video"
                                    }
                                )

                                user.summaries.push(summary);

                                user.save((err: any) => {
                                    if (err) {
                                        res.status(500).send(JSON.stringify('Internal server error.'));
                                        return
                                    }
                                })
                            })
                            break;

                        case "mp4":
                            /** @todo make llm request */

                            this._mongo.users().findById(req.body.userId, (err: any, user: any) => {
                                if (err) {
                                    res.status(500).send(JSON.stringify('Internal server error.'));
                                    return
                                }

                                if (user === null) {
                                    res.status(404).send(JSON.stringify('User not found.'));
                                    return
                                }

                                let summary = this._mongo.summaries().create(
                                    {
                                        rawContent: "transcript",
                                        summedContent: [],
                                        type: "text"
                                    }
                                )

                                user.summaries.push(summary);

                                user.save((err: any) => {
                                    if (err) {
                                        res.status(500).send(JSON.stringify('Internal server error.'));
                                        return
                                    }
                                })

                            })
                            break;

                        case "pdf":
                            // make tmp directory
                            // parse "local" pdf
                            // make llm request
                            // save to db
                            res.status(501).send(JSON.stringify('Not implemented.'));
                            break;

                        case "text/plain":
                            console.log(file)

                            this._mongo.users().findById(req.body.userId, (err: any, user: any) => {
                                if (err) {
                                    res.status(500).send(JSON.stringify('Internal server error.'));
                                    return
                                }

                                if (user === null) {
                                    res.status(404).send(JSON.stringify('User not found.'));
                                    return
                                }

                                /** @todo make llm request */

                                let summary = this._mongo.summaries()?.create(
                                    <Summary>{
                                        rawContent: [file],
                                        summedContent: [],
                                        type: req.body.type
                                    }, (err: any, summary: any) => {
                                        if (err) {
                                            res.status(500).send(JSON.stringify('Internal server error.'));
                                        }

                                        user.summaries.push(summary._id)

                                        user.save()
                                    }
                                )
                            })
                            break;

                        default:
                            res.status(400).send(JSON.stringify('Bad request.')); ``
                    }
                }
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
        router.get('/api/v1/summary/:id', this.isLoggedIn, (req, res) => {
            if (req.params.id === null) {
                res.status(400).send(JSON.stringify('Bad request.'));
            }

            let summary = this._mongo.summaries().findById(req.params.id, (err: any, summary: any) => {
                if (err) {
                    res.status(500).send(JSON.stringify('Internal server error.'));
                }

                if (summary === null) {
                    res.status(404).send(JSON.stringify('Summary not found.'));
                }

                res.status(200).send(JSON.stringify(summary));
            })

            res.status(200).json(summary);
        })

        /**
         * Route for creating a new user and logging in a user
         * 
         * POST body:
         * ```json
         * {
         * }
         * ```
         */
        router.post('/api/v1/users/login', (req, res) => {
            console.log('we have bee hit');
            if (req.body === null) {
                res.status(400).send(JSON.stringify('Bad request.'));
            } else {
                console.log('we have bee hit 2');
                let { idToken, email } = req.body;
                console.log(idToken, email);
                const uid = this.randomStringToHash24Bits(idToken);
                console.log(uid);
                let user = this._mongo.users().findById(uid, async (err: any, user: any) => {
                    if (err) {
                        res.status(500).send(JSON.stringify('Internal server error.'));

                        return;
                    }
                    console.log('we have bee hit 3');
                    console.log(user);
                    if (!user) {
                        const user = await this._mongo.users().create(
                            <User>{
                                _id: uid,
                                username: email,
                                summaries: []
                            }, (err: any, user: any) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send(JSON.stringify('Internal server error.'));
                                    return;
                                }
                            })
                        console.log(user);
                        console.log('we have bee hit 4');
                        let token = jwt.sign({ _id: uid, }, <string>this._jwtPk, { expiresIn: "1000d" });
                        res.status(200).send({ token: token, message: 'Login successful' });
                    } else {
                        console.log('we have bee hit 5');
                        let token = jwt.sign({ _id: uid, }, <string>this._jwtPk, { expiresIn: "1000d" });
                        res.status(200).send({ token: token, message: 'Login successful' });
                    }
                })
            }
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
                let decoded = jwt.verify(token, <string>this._jwtPk);

                console.log(decoded);

                let user = this._mongo.users().findById(decoded, (err: any, user: any) => {
                    if (err) {
                        res.status(500).send(JSON.stringify('Internal server error.'));
                    }
                })

                if (!user) {
                    return res.status(401).send(JSON.stringify("no user found"));
                }

                res.userId = 1/*decoded._id*/;
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
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))

        app.use(this.init());
        app.listen(3000, () => {
            console.log('✅ API listening on port 3000!');
        })
    }
}