"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = void 0;
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const multer_1 = __importDefault(require("multer"));
const body_parser_1 = __importDefault(require("body-parser"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongo_js_1 = require("./mongo.js");
let upload = (0, multer_1.default)({ dest: 'uploads/' });
class Api {
    constructor(mongoUri, jwtPk) {
        this.isLoggedIn = (req, res, next) => {
            let token = req.headers["x-access'cramberry-auth-token"];
            //check if token exists or is null in an if statement
            if (!token || token === "" || token === undefined || token === null || token === "null") {
                return res.status(401).send(JSON.stringify("not logged in"));
            }
            else {
                try {
                    let decoded = jsonwebtoken_1.default.verify(token, this._jwtPk);
                    console.log(decoded);
                    let user = this._mongo.users().findById(decoded, (err, user) => {
                        if (err) {
                            res.status(500).send(JSON.stringify('Internal server error.'));
                        }
                    });
                    if (!user) {
                        return res.status(401).send(JSON.stringify("no user found"));
                    }
                    res.userId = 1 /*decoded._id*/;
                }
                catch (e) {
                    return res.status(500).send(JSON.stringify("internal server error"));
                }
            }
            next();
        };
        this._mongo = new mongo_js_1.MongoHandler(mongoUri);
        this._jwtPk = jwtPk;
        this._mongo.init();
    }
    /**
     *  Initializes the API routes
     * @returns {express.Router} The router for the api
     */
    init() {
        let router = express_1.default.Router();
        router.get('/', (req, res) => {
            res.json({ message: 'hooray! welcome to our api!' });
        });
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
        router.post('/api/v1/summary/new', this.isLoggedIn, upload.array('files'), (req, res) => {
            if (req.body == null) {
                res.status(400).send(JSON.stringify('Bad request.'));
            }
            for (let file of req.files) {
                switch (file.mimetype) {
                    case "mov":
                        // make llm request
                        // save to db
                        this._mongo.users().findById(req.body.userId, (err, user) => {
                            if (err) {
                                res.status(500).send(JSON.stringify('Internal server error.'));
                            }
                            if (user === null) {
                                res.status(404).send(JSON.stringify('User not found.'));
                            }
                            let summary = this._mongo.summaries().create({
                                rawContent: file,
                                summedContent: [],
                                type: "video"
                            });
                            user.summaries.push(summary);
                            user.save((err) => {
                                if (err) {
                                    res.status(500).send(JSON.stringify('Internal server error.'));
                                }
                            });
                            res.status(200).send(JSON.stringify('Success.'));
                        });
                        break;
                    case "mp4":
                        /** @todo make llm request */
                        this._mongo.users().findById(req.body.userId, (err, user) => {
                            if (err) {
                                res.status(500).send(JSON.stringify('Internal server error.'));
                            }
                            if (user === null) {
                                res.status(404).send(JSON.stringify('User not found.'));
                            }
                            let summary = this._mongo.summaries().create({
                                rawContent: "transcript",
                                summedContent: [],
                                type: "text"
                            });
                            user.summaries.push(summary);
                            user.save((err) => {
                                if (err) {
                                    res.status(500).send(JSON.stringify('Internal server error.'));
                                }
                            });
                            res.status(200).send(JSON.stringify('Success.'));
                        });
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
                        console.log(file);
                        this._mongo.users().findById(req.body.userId, (err, user) => {
                            var _a;
                            if (err) {
                                res.status(500).send(JSON.stringify('Internal server error.'));
                            }
                            if (user === null) {
                                res.status(404).send(JSON.stringify('User not found.'));
                            }
                            /** @todo make llm request */
                            let summary = (_a = this._mongo.summaries()) === null || _a === void 0 ? void 0 : _a.create({
                                rawContent: [file],
                                summedContent: [],
                                type: req.body.type
                            }, (err, summary) => {
                                if (err) {
                                    res.status(500).send(JSON.stringify('Internal server error.'));
                                }
                                user.summaries.push(summary._id);
                                user.save();
                            });
                        });
                        res.status(200).send(JSON.stringify('Success.'));
                        break;
                    default:
                        res.status(400).send(JSON.stringify('Bad request.'));
                        ``;
                }
            }
        });
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
            let summary = this._mongo.summaries().findById(req.params.id, (err, summary) => {
                if (err) {
                    res.status(500).send(JSON.stringify('Internal server error.'));
                }
                if (summary === null) {
                    res.status(404).send(JSON.stringify('Summary not found.'));
                }
                res.status(200).send(JSON.stringify(summary));
            });
            res.status(200).json(summary);
        });
        /**
         * Route for creating a new user and logging in a user
         *
         * POST body:
         * ```json
         * {
         * }
         * ```
         */
        router.get('/api/v1/users/login', (req, res) => {
            if (req.body === null) {
                res.status(400).send(JSON.stringify('Bad request.'));
            }
            else {
                let { idToken, email } = req.body;
                let uid = this.randomStringToHash24Bits("idToken");
                let user = this._mongo.users().findById(uid, (err, user) => {
                    if (err) {
                        res.status(500).send(JSON.stringify('Internal server error.'));
                        return;
                    }
                    if (!user) {
                        this._mongo.users().create({
                            username: email,
                            password: idToken,
                            summaries: []
                        }, (err, user) => {
                            if (err) {
                                res.status(500).send(JSON.stringify('Internal server error.'));
                                return;
                            }
                        });
                        let token = jsonwebtoken_1.default.sign({ _id: uid, }, this._jwtPk, { expiresIn: "1000d" });
                        res.status(201).send(JSON.stringify('User created.' + 'Token:  + token'));
                        return;
                    }
                });
                let token = jsonwebtoken_1.default.sign({ _id: uid, }, this._jwtPk, { expiresIn: "1000d" });
                res.status(200).send(JSON.stringify('User found.'));
            }
        });
        return (router);
    }
    handleNewSummaryRequest(req) {
    }
    handleGetSummaryRequest(req) {
    }
    handleNewUserRequest(req) {
    }
    handleLoginUserRequest(req) {
    }
    randomStringToHash24Bits(inputString) {
        return crypto_1.default.createHash('sha256').update(inputString).digest('hex').substring(0, 24);
    }
    /**
     * Starts the API server
     *
     * @returns {void}
     * @memberof API
     */
    start() {
        let app = (0, express_1.default)();
        app.use(body_parser_1.default.json());
        app.use(body_parser_1.default.urlencoded({ extended: true }));
        app.use(this.init());
        app.listen(3000, () => {
            console.log('✅ API listening on port 3000!');
        });
    }
}
exports.Api = Api;
