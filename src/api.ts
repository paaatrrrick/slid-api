import express, { Request } from 'express';
import { ConnectionClosedEvent } from 'mongodb';
import fs from 'fs';
import os from 'os';
import path from 'path';
import multer from 'multer';
import bodyParser from 'body-parser';
import pdf from 'pdf-parse';
import { Summary, User } from './models.js';
import { MongoHandler } from "./mongo.js";

let upload = multer({ dest: 'uploads/' })

export class Api {
    private _mongo: MongoHandler;

    constructor(mongoUri: string | undefined) {
        this._mongo = new MongoHandler(mongoUri);

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
        router.post('/api/v1/summary/new', upload.array('files'), (req: any, res: any) => {
            if (req.body == null) {
                res.status(400).send(JSON.stringify('Bad request.'));
            }

            for (let file of req.files) {
                switch (file.mimetype) {
                    case "mov":
                        // make llm request
                        // save to db
                        this._mongo.users().findById(req.body.userId, (err: any, user: any) => {
                            if (err) {
                                res.status(500).send(JSON.stringify('Internal server error.'));
                            }

                            if (user === null) {
                                res.status(404).send(JSON.stringify('User not found.'));
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
                                }
                            })

                            res.status(200).send(JSON.stringify('Success.'));
                        })
                        break;

                    case "mp4":
                        /** @todo make llm request */

                        this._mongo.users().findById(req.body.userId, (err: any, user: any) => {
                            if (err) {
                                res.status(500).send(JSON.stringify('Internal server error.'));
                            }

                            if (user === null) {
                                res.status(404).send(JSON.stringify('User not found.'));
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
                                }
                            })

                            res.status(200).send(JSON.stringify('Success.'));
                        })
                        break;

                    case "pdf":
                        // make tmp directory
                        // parse "local" pdf
                        // make llm request
                        // save to db
                        res.status(501).send(JSON.stringify('Not implemented.'));
                        break;

                    case "jpg":
                        // make llm request
                        // save to db
                        res.status(501).send(JSON.stringify('Not implemented.'));
                        break;

                    case "png":
                        // make llm request
                        // save to db
                        res.status(501).send(JSON.stringify('Not implemented.'));
                        break;

                    case "text/plain":
                        console.log(file)

                        this._mongo.users().findById(req.body.userId, (err: any, user: any) => {
                            if (err) {
                                res.status(500).send(JSON.stringify('Internal server error.'));
                            }

                            // if (user === null) {
                            //     res.status(404).send(JSON.stringify('User not found.'));
                            // }

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

                        res.status(200).send(JSON.stringify('Success.'));
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
        router.get('/api/v1/summary/:id', (req, res) => {
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
         * Route for creating a new user
         * POST body:
         * ```json
         * {
         * "username": string,
         * "password": string
         * }
         * ```
         */
        router.post('/api/v1/users/new', (req, res) => {
            if (req.body === null) {
                res.status(400).send(JSON.stringify('Bad request.'));
            } else {
                console.log(req.body);

                if (req.body.username === null || req.body.password === null) {
                    res.status(400).send(JSON.stringify('Bad request.'));
                } else {
                    this._mongo.users().create(
                        <User>{
                            username: req.body.username,
                            password: req.body.password,
                            summaries: []
                        }, (err: any, user: any) => {
                            if (err) {
                                res.status(500).send(JSON.stringify('Internal server error.'));
                            }

                            res.status(200).send(JSON.stringify('Success.'));
                        })
                }

            }
        })

        /**
         * Route for logging in a user
         */
        router.post('/api/v1/user/login', (req, res) => {

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

    // private isLoggedIn = (req: any, res: any, next: any) => {
    //     const token = req.headers["x-access'wordsmith-auth-token"];

    //     //check if token exists or is null in an if statement
    //     if (!token || token === "" || token === undefined || token === null || token === "null") {
    //         return res.status(401).send(JSON.stringify("not-logged-in"));
    //     } else {
    //         try {
    //             const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    //             const user = users.findById(decoded._id);
    //             if (!user) {
    //                 return res.status(401).send(JSON.stringify("no user found"));
    //             }
    //             res.userId = decoded._id;
    //         } catch (er) {
    //             return res.status(401).send(JSON.stringify("ERROR"));
    //         }
    //     }
    //     next();
    // };

    /**
     * Starts the API server
     * 
     * @returns {void}
     * @memberof API
     */
    start() {
        let app = express();
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))

        app.use(this.init());

        app.listen(3000, () => {
            console.log('✅ API listening on port 3000!');
        })
    }
}