# ASUConfexScheduler

# ASU Confex Scheduler

* Welcome to the Conference Scheduler created by the ASU Capstone Team 17 - Scheduling of Conference Sessions.
* Team members who contributed to this project are:
    * Kyle Cenatiempo
    * Alex Zacco
    * Wilmin Ceballos
    * Samantha Halliburton

## Getting Started

### Install dependencies
1. Make sure you have [Node 16](https://nodejs.org/en/download/) or newer
installed. Then install [Firebase CLI](https://firebase.google.com/docs/cli):
```
npm install -g firebase-tools
```
You may be required to log in by running `firebase login` and select the
project to use with `firebase use PROJECT_ID`. We set up our project id to
"asuconfexscheduler" when we created the project in the Firebase console, but
yours may be different.
2. Go to the project root directory `ASUConfexScheduler`.
3. Install the **server** dependencies
```
npm install
```
4. Install the **client** dependencies

Inside the client directory:
```
npm install
```

### Configure the development environment
When running the client locally, it is important to change the port number
to something other than the default (3000). It is also necessary to set the
environment variable NODE_ENV to development. This can be done with a .env file.
Create a text file client/.env with these environment variables:
```
NODE_ENV=development
HOST=localhost
PORT=3001
```

When using firebase emulators, the host and port configurations are read from
`firebase.json` in the project root directory and can be modified there, but
the current defaults are fine.

This setup has room for improvement, ideally one without needing a .env file
and having all configurations in one place.

### Run
#### Option 1: run the client and server concurrently with firebase emulators
This will launch the client and server locally on different ports according to
the emulator configuration in `firebase.json` in the project root directory.
```
firebase emulators:start
```
*Tip: The emulator will listen for file changes and apply the updates
automatically.*

#### Option 2: run the server alone
With firebase emulators:
```
npm run start
```
(The start script is an alias for `firebase emulators:start --only functions`).

#### Option 3: run the client alone
With react scripts:
```
npm --prefix client run start
```
Or with firebase emulators:
```
firebase emulators:start --only hosting
```

#### Whitelist Users
Only whitelisted users can make API calls to the server. The server checks that
calls contain the HTTP header: `Authorization: Bearer <token>`, where `<token>`
is the user's UID. The client adds this header automatically.

User UIDs are stored in Firebase functions config as a string of comma separated
values. The following command stores two UIDs:
```
firebase functions:config:set whitelist.users=uid1,uid2
```
You can verify the UIDs stored:
```
firebase functions:config:get
```
Output:
```
{
  "whitelist": {
    "users": "uid1,uid2"
  }
}
```
In order to run the emulators locally, the Firebase functions config be stored
locally in the file `.runtimeconfig.json`. This can be done with:
```
firebase functions:config:get > .runtimeconfig.json
```
Or with Windows Powershell:
```
firebase functions:config:get | ac .runtimeconfig.json
```

## Running Unit Tests

The unit tests are developed with a framework call Jest and another helper library called Supertest.  In order to run the unit tests, you can run the following command:

`npm run test`

This will run all the unit tests from the `test` directory at once.  If all the tests pass, you should see a message like: `Tests:       0 failed, N passed, N total`

## API Documentation:

There are a lot of API endpoints used for this project.  Below is an outline of the different endpoints as well as their descriptions, inputs, and return values.

### Root API URI

If the project is being ran in development mode, then the API endpoints will all start with the following URI:

`http://localhost:3000/${PROJECT_ID}/us-central1/api`

If the project is being ran in production, then the API endpoints will all start with the following URI instead:
`https://us-central1-${PROJECT_ID}.cloudfunctions.net/api`

After the prefix based on the hosting environment, the following paths can be used to reach specific API endpoints:

download scheduled:
`/data/ScheduledSessions`
Downloads the scheduled sessions that are stored in the database.

filter dates:
`/data/dateFilter`
Gets the date filter for the API to return objects from a specific date range.

filter rooms:
`/data/roomFilter`
Sets the room filter for the API to return objects from a specific room selection.

filter sessions:
`/data/sessionFilter`
Sets the session filter for the API to return objects from a specific set of sessions.

upload session:
`/data/UnscheduledSession`
Upload a particular session to the UnsecheduledSessions table in the database.

upload sessions:
`/data/UnscheduledSessions`
Upload secheduled sessions to the UnscheduledSessions table in the database.

allRooms:
`/data/HotelRooms`
Get all the hotel rooms from the HotelRooms table in the database.

roomHotelOptions:
`/data/roomHotelOptions`
Set all the hotel room options.

avOptions:
`/data/avOptions`
Get all AV options that are available for conference rooms.

storeScheduleSessions:
`/data/storeScheduleSessions`
Store schedule sessions information.

getConferenceTimes:
`/data/getConferenceTimes`
Get conference times from the database table that stores them.	

sessionFilterOptions:
`/data/sessionFilterOptions`
Set the filter options for sessions.

conferenceTimes:
`/data/conferenceTimes`
Get a list of conference times.

purgeDb:
`/data/purgeDB`
Completely purge the database to prepare it for new information.

##### ERRORS
- 500: Server side error
    Unknown solution: only happens when unexpected server side error occurs.
- 404: Query parameters where unsuccessful in fetch data from backend
    Solution: Code current sends empty req.body if fetch does return data from query.
- 422: Incorrect Inputs passed to Backend
    Solution: Currently we dont allow for any inputs to be passed that are not already in the database so this error should never be thrown. If it does there is likely a coding mistake.
