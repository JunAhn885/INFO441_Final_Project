"use strict";

import path from "node:path";
import { fileURLToPath } from "node:url";

import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import sessions from "express-session";
import { initializeApp } from "firebase/app";
import { equalTo, get, getDatabase, onValue, orderByChild, query, ref, set } from "firebase/database";
import msIdExpress from "microsoft-identity-express";
import logger from "morgan";

dotenv.config();

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initializeApp(firebaseConfig);

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}))

const msid = new msIdExpress.WebAppAuthClientBuilder(msalSettings).build()
app.use(msid.initialize())

app.get("/signIn",
  msid.signIn({ postLoginRedirect: "/" })
)

app.get("/signOut",
  msid.signOut({ postLogoutRedirect: "/" })
)

app.get("/error", (req, res) => {
  res.status(500).send("Error: Server error")
})

app.get("/unauthorized", (req, res) => {
  res.status(401).send("Error: Unauthorized")
})

app.get("/test", async (req, res) => {
  //  take a random value from the database and return it
  const db = getDatabase();
  const testRef = ref(db, "/organizations/sample_0/due/amount");
  const testSnap = await get(testRef);
  await set(testRef, 69.420);
  res.send("Retrieved value is " + testSnap.val().toString());
});

export default app;