import cookieParser from 'cookie-parser';
import express from 'express';
import sessions from 'express-session';
import { initializeApp } from "firebase/app";
import msIdExpress from 'microsoft-identity-express';
import logger from 'morgan';
import path from 'path';

import { equalTo, get, getDatabase, onValue, orderByChild, query, ref, set } from "firebase/database";

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const msalSettings = {
  appCredentials: {
    clientId: "407cbb1f-0a2f-4717-8ac4-09825f1b1aaf",
    tenantId: "f6b6dd5b-f02f-441a-99a0-162ac5060bd2",
    clientSecret: "vdp8Q~5wXbKDxDGZzrSI7503okZ2XdLQb4fX6blv"
  },
  authRoutes: {
    redirect: "http://localhost:3000/redirect", //note: you can explicitly make this "localhost:3000/redirect" or "examplesite.me/redirect"
    error: "/error", // the wrapper will redirect to this route in case of any error.
    unauthorized: "/unauthorized" // the wrapper will redirect to this route in case of unauthorized access attempt.
  }
};

const firebaseConfig = {
  apiKey: "AIzaSyBb1UsOfbVL_uzCa-Vlm6P-8jCy-KZ-xJg",
  authDomain: "human-outsourcers.firebaseapp.com",
  databaseURL: "https://human-outsourcers-default-rtdb.firebaseio.com",
  projectId: "human-outsourcers",
  storageBucket: "human-outsourcers.appspot.com",
  messagingSenderId: "603992599874",
  appId: "1:603992599874:web:817ddb2547a1156d84acdb"
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const firebaseApp = initializeApp(firebaseConfig);

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const oneDay = 1000 * 60 * 60 * 24
app.use(sessions({
  secret: "Login",
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}))

const msid = new msIdExpress.WebAppAuthClientBuilder(msalSettings).build()
app.use(msid.initialize())

app.get('/signin',
  msid.signIn({ postLoginRedirect: '/' })
)

app.get('/signout',
  msid.signOut({ postLogoutRedirect: '/' })
)

app.get('/error', (req, res) => {
  res.status(500).send("Error: Server error")
})

app.get('/unauthorized', (req, res) => {
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