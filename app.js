"use strict";

import path from "node:path";
import url from "node:url";

import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import "express-async-errors";
import session from "express-session";
import { initializeApp } from "firebase/app";
import { equalTo, get, getDatabase, onValue, orderByChild, query, ref, set } from "firebase/database";
import msIdExpress from "microsoft-identity-express";
import logger from "morgan";
import fileStore from "session-file-store";

import apiRouter from "./routes/api/api.js";

// Load environment variables
dotenv.config();

// Create setting objects
const msalSettings = {
  appCredentials: {
    clientId: process.env.AZURE_CLIENT_ID,
    tenantId: process.env.AZURE_TENANT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET
  },
  authRoutes: {
    redirect: process.env.REDIRECT_URI_BASE + "/redirect",
    error: "/error",
    unauthorized: "/unauthorized"
  }
};

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Realtime Database
initializeApp(firebaseConfig);

// Initialize Express
const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Initialize Express session
const oneDay = 1000 * 60 * 60 * 24;
if (process.env.DEBUG) {
  console.log("Using file session store");
  const FileStore = fileStore(session);
  app.use(session({
    store: new FileStore({}),
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
  }));
} else {
  console.log("Using in-memory session store");
  app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
  }));
}

// Initialize Azure Auth
const msid = new msIdExpress.WebAppAuthClientBuilder(msalSettings).build();
app.use(msid.initialize());

app.get("/signIn",
  msid.signIn({ postLoginRedirect: "/" })
);

app.get("/signOut",
  msid.signOut({ postLogoutRedirect: "/" })
);

app.get("/error", (req, res) => {
  res.status(500).send("Error: Server error")
});

app.get("/unauthorized", (req, res) => {
  res.status(401).send("Error: Unauthorized")
});

// Register API routes
app.use("/api", apiRouter);

export default app;