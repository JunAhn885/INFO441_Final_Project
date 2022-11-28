# Development Notes

## Configuring Your Environment

After cloning the repository, run `npm install` to install all dependencies.

## Uploading Sample Data to Firebase

During early development, you can run a script to reset Firebase realtime
database to a sample database.
**Doing so will overwrite all existing data in the database.**
To do so:

- Go to [Firebase project settings](https://console.firebase.google.com/u/0/project/human-outsourcers/settings/serviceaccounts/adminsdk)
  and hit **Generate new private key** to download your key.
  This only needs to be done once.
  Keep the downloaded file, but do not check it into the repository.
- Run `npm install --include-dev` in project folder to install
  dependencies needed for the script.
- Run `npm run upload-sample-data` in project folder.
  The script will prompt for a path to "Firebase private key".
  Paste the path to the previously downloaded private key.
