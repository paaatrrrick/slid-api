// import { MongoClient, Collection, Db } from 'mongodb';
import mongoose, { Schema } from 'mongoose';
import { User, Summary } from './models.js'
const MONGO_URI = "";

export class MongoHandler {
    /**
     * The URI for the mongo database
     * 
     * @type {string | undefined}
     * @private
     * @memberof MongoHandler
     */
    private _uri: string | undefined;

    /**
     * The user model for inderacting with users in the the mongo database
     * 
     * @type {mongoose.Model<User>}
     * @private
     * @memberof MongoHandler
     */
    private _userModel: any;

    /**
     * The summary model for interacting with the summaries in the mongo database
     * 
     * @type {mongoose.Model<Summary>}
     * @private
     * @memberof MongoHandler
     */
    private _summaryModel: any;

    constructor(uri: string | undefined) {
        if (uri === undefined) {
            throw new Error("MongoDB URI is not set");
        }

        this._uri = uri;
    }

    /**
     * @todo abstract away model creation
     */
    async init() {
        mongoose.set('strictQuery', false);
        await mongoose.connect(<string>this._uri);

        let userSchema = new Schema<User>({
            username: String,
            password: String,
            summaries: []
        })

        let summariesSchema = new Schema<Summary>({
            rawContent: [],
            summedContent: [],
            type: String
        })

        this._userModel = mongoose.model<User>('User', userSchema);
        this._summaryModel = mongoose.model<Summary>('Summary', summariesSchema);
    }

    users() {
        return this._userModel;
    }

    summaries() {
        return this._summaryModel;
    }
}