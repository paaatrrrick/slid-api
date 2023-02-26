import express, { Request } from 'express';
import { ConnectionClosedEvent } from 'mongodb';
import fs from 'fs';
import os from 'os';
import path from 'path';
import multer from 'multer';
import bodyParser from 'body-parser';
import { Summary, User } from './models.js';
import { MongoHandler } from "./mongo.js";
import { GridFSBucket } from 'mongodb';
import mongodb from "mongodb";

// const fs = require('fs')
const https = require('https')
const { execSync: exec } = require('child_process')
const { Deepgram } = require('@deepgram/sdk')
const ffmpegStatic = require('ffmpeg-static')
const ffmpeg = require('ffmpeg')

// import PDFParser from "pdf2json";
// import VideoToAudio from 'video-to-audio'
// var videoToAudio = require('videoToAudio');

var PDFParser = require("pdf2json");

let upload = multer({ dest: 'uploads/' })
// async function transcribeLocalVideo(filePath:any) {
//     ffmpeg(`-hide_banner -y -i ${filePath} ${filePath}.wav`)
  
//     const audioFile = {
//       buffer: fs.readFileSync(`${filePath}.wav`),
//       mimetype: 'audio/wav',
//     }
//     const deepgram = new Deepgram("b391e8c767d8240d5c9409c3716526957487306f");

//     const response = await deepgram.transcription.preRecorded(audioFile, {
//       punctuation: true,
//     })
//     return response.results
//   }
  
//   transcribeLocalVideo('deepgram.mp4').then((transcript) =>
    // console.dir(transcript, { depth: null })
//   )

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
            let str:string ;
            for (let file of req.files) {
                console.log(file);
                switch (file.mimetype) {
                    case "mov":
                        // make llm request
                        // save to db
                        fs.readFile(file.path, 'binary', function(err, data){
      
                            // Display the file content
                            str = data;
                            console.log(data);
                        });
                        // console.log(os.tmpdir());
                        

                        this._mongo.users().findById(req.body.userId, (err: any, user: any) => {
                            if (err) {
                                res.status(500).send(JSON.stringify('Internal server error.'));
                            }
                            let summary = this._mongo.summaries()?.create(
                                <Summary>{
                                    rawContent: str,
                                    summedContent: [],
                                    type: "mov"
                                }, (err: any, summary: any) => {
                                    if (err) {
                                        res.status(500).send(JSON.stringify('Internal server error.'));
                                    }

                                    user.summaries.push(summary._id)

                                    user.save()
                                }
                            )
                        })

                        // res.status(200).send(JSON.stringify('Success.'));
                        // break;
                        res.status(501).send(JSON.stringify('Not implemented.'));
                        break;

                    case "mp4":
                        /** @todo make llm request */
                        let sourceVideoFile = fs.open(file.path,'r',function(err, data){
                        });

                        
                        
                        fs.readFile(file.path, 'binary', function(err, data){
      
                            // Display the file content
                            str = data;
                            console.log(data);
                        });
                        // console.log(os.tmpdir());
                        

                        this._mongo.users().findById(req.body.userId, (err: any, user: any) => {
                            if (err) {
                                res.status(500).send(JSON.stringify('Internal server error.'));
                            }
                            let summary = this._mongo.summaries()?.create(
                                <Summary>{
                                    rawContent: str,
                                    summedContent: [],
                                    type: "mp4"
                                }, (err: any, summary: any) => {
                                    if (err) {
                                        res.status(500).send(JSON.stringify('Internal server error.'));
                                    }

                                    user.summaries.push(summary._id)

                                    user.save()
                                }
                            )
                        })

                        // res.status(200).send(JSON.stringify('Success.'));
                        // break;
                        res.status(501).send(JSON.stringify('Not implemented.'));
                        break;

                    case "application/pdf":


                        // console.log("get pdf")
                        // make tmp directory
                        // const pdfParser = new PDFParser(this,1);
                        // // console.log(os.tmpdir+file.originalname);
                        // fs.writeFile(os.tmpdir()+file.originalname, file, (err) => {
                        //     if (err)
                        //       console.log(err);
                        //     else {
                        //       console.log("File written successfully\n");
                        //       console.log("The written has the following contents:");
                        //       console.log(fs.readFileSync("books.txt", "utf8"));
                        //     }
                        //   });
                        // fs.writeFile(os.tmpdir()+file.originalname, file);
                        // console.log(upload+file.filename);
                        // pdfParser.loadPDF(file.path);
                        
                        // pdfParser.on("pdfParser_dataError", (errData:any) => console.error(errData.parserError)); pdfParser.on("pdfParser_dataReady", (pdfData:any) => {
                        //      let data = pdfParser.getRawTextContent().replace(/-/g,"");
                             
                        //      console.log("TEST:"+data);
                        //  });
                        // parse "local" pdf
                        // make llm request
                        // save to db
                        fs.readFile(file.path, 'binary', function(err, data){
      
                            // Display the file content
                            str = data;
                            console.log(data);
                        });
                        // console.log(os.tmpdir());
                        

                        this._mongo.users().findById(req.body.userId, (err: any, user: any) => {
                            if (err) {
                                res.status(500).send(JSON.stringify('Internal server error.'));
                            }
                            let summary = this._mongo.summaries()?.create(
                                <Summary>{
                                    rawContent: str,
                                    summedContent: [],
                                    type: "pdf"
                                }, (err: any, summary: any) => {
                                    if (err) {
                                        res.status(500).send(JSON.stringify('Internal server error.'));
                                    }

                                    user.summaries.push(summary._id)

                                    user.save()
                                }
                            )
                        })

                        // res.status(200).send(JSON.stringify('Success.'));
                        // break;
                        res.status(501).send(JSON.stringify('Not implemented.'));
                        break;

                    // case "image/jpeg":
                    //     fs.readFile(file.path, 'binary', function(err, data){
      
                    //         // Display the file content
                    //         str = data;
                    //         console.log(data);
                    //     });
                    //     // console.log(os.tmpdir());
                        

                    //     this._mongo.users().findById(req.body.userId, (err: any, user: any) => {
                    //         if (err) {
                    //             res.status(500).send(JSON.stringify('Internal server error.'));
                    //         }
                    //         let summary = this._mongo.summaries()?.create(
                    //             <Summary>{
                    //                 rawContent: str,
                    //                 summedContent: [],
                    //                 type: "jpg"
                    //             }, (err: any, summary: any) => {
                    //                 if (err) {
                    //                     res.status(500).send(JSON.stringify('Internal server error.'));
                    //                 }

                    //                 user.summaries.push(summary._id)

                    //                 user.save()
                    //             }
                    //         )
                    //     })

                    //     // res.status(200).send(JSON.stringify('Success.'));
                    //     // break;
                    //     res.status(501).send(JSON.stringify('Not implemented.'));
                    //     break;
                        

                    // case "image/png":
                    //     // make llm request
                    //     // save to db
                        
                    //     console.log("get png")
                        
                    //     fs.readFile(file.path, 'binary', function(err, data){
      
                    //         // Display the file content
                    //         str = data;
                    //         console.log(data);
                    //     });
                    //     // console.log(os.tmpdir());
                        

                    //     this._mongo.users().findById(req.body.userId, (err: any, user: any) => {
                    //         if (err) {
                    //             res.status(500).send(JSON.stringify('Internal server error.'));
                    //         }
                    //         let summary = this._mongo.summaries()?.create(
                    //             <Summary>{
                    //                 rawContent: str,
                    //                 summedContent: [],
                    //                 type: "png"
                    //             }, (err: any, summary: any) => {
                    //                 if (err) {
                    //                     res.status(500).send(JSON.stringify('Internal server error.'));
                    //                 }

                    //                 user.summaries.push(summary._id)

                    //                 user.save()
                    //             }
                    //         )
                    //     })

                    //     // res.status(200).send(JSON.stringify('Success.'));
                    //     // break;
                    //     res.status(501).send(JSON.stringify('Not implemented.'));
                    //     break;

                    case "text/plain":
                        
                        fs.readFile(file.path, 'binary', function(err, data){
      
                            // Display the file content
                            str = data;
                            console.log(data);
                        });
                        // console.log(os.tmpdir());
                        

                        this._mongo.users().findById(req.body.userId, (err: any, user: any) => {
                            if (err) {
                                res.status(500).send(JSON.stringify('Internal server error.'));
                            }
                            let summary = this._mongo.summaries()?.create(
                                <Summary>{
                                    rawContent: str,
                                    summedContent: [],
                                    type: "plaintext"
                                }, (err: any, summary: any) => {
                                    if (err) {
                                        res.status(500).send(JSON.stringify('Internal server error.'));
                                    }

                                    user.summaries.push(summary._id)

                                    user.save()
                                }
                            )
                        })

                        // res.status(200).send(JSON.stringify('Success.'));
                        // break;
                        res.status(501).send(JSON.stringify('Not implemented.'));
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