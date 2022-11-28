// Uploads sample-data.json to Firebase.

import fs from "node:fs/promises";
import readline from "node:readline";

import admin from "firebase-admin";

const FIREBASE_DATABASE_URL = "https://human-outsourcers-default-rtdb.firebaseio.com/";
const SAMPLE_DATA_PATH = "scripts/sample-data.json";
const BACKUP_DATA_PATH = "scripts/backup-data.json";

async function fileExists(path) {
  if (!path) {
    return false;
  }

  try {
    const stat = await fs.stat(path);
    return stat.isFile();
  } catch (_) {
    return false;
  }
}

async function initializeFirebase() {
  // https://nodejs.org/en/knowledge/command-line/how-to-prompt-for-command-line-input/
  const io = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const credPath = await new Promise((res) => {
    io.question("Path to Firebase private key: ", res);
  });
  io.close();

  if (await fileExists(credPath)) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(credPath),
        databaseURL: FIREBASE_DATABASE_URL
      });
      return true;
    } catch (err) {
      console.log("Firebase admin error: " + err.message);
    }
  } else {
    console.log("Invalid private key path.");
  }

  return false;
}

async function uploadData() {
  const db = admin.database();
  const ref = db.ref("/");

  // Back up existing data
  const refSnap = await ref.get();
  const refData = await refSnap.exportVal();
  const refJson = JSON.stringify(refData);
  await fs.writeFile(BACKUP_DATA_PATH, refJson);
  console.log("Database backup saved to " + BACKUP_DATA_PATH);

  // Upload sample data
  console.log("Uploading sample data");
  const data = await fs.readFile(SAMPLE_DATA_PATH);
  const dataJson = JSON.parse(data);
  await ref.remove();
  await ref.set(dataJson);
}

async function main() {
  if (!await initializeFirebase()) {
    console.log("Could not initialize Firebase admin.");
  }

  await uploadData();
}

main().then(() => {
  console.log("Done.");
}).catch(err => {
  console.log(err);
});
