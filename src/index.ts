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
const ffmpegStatic = require('ffmpeg-static')
const { execSync: exec } = require('child_process')
dotenv.config();
async function ffmpeg(command:any) {
    return new Promise((resolve, reject) => {
      exec(`${ffmpegStatic} ${command}`, (err:any, stderr:any, stdout:any) => {
        if (err) reject(err)
        resolve(stdout)
      })
    })
  }
async function main() {
    let api = new Api(process.env.MONGO_URI);
    api.init();


    api.start();
}



main();