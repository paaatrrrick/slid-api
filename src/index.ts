import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
import bodyParser from 'body-parser';
// import cookieParser from "cookie-parser";
import multer from 'multer';
import path from 'path';
// import users from './models/users.js';
// import {
//     getAuth,
//     createUserWithEmailAndPassword,
//     signInWithEmailAndPassword,
//     signOut,
//     GoogleAuthProvider,
// } from 'firebase/auth';
// import initializeApp from 'firebase/app';

import { Api } from './api.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    let api = new Api(process.env.MONGO_URI, process.env.JWT_PRIVATE_KEY);
    api.init();


    api.start();
}

main();