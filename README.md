# MLB Admin
![img](/assets/7x7_pixel4-min.png)
![img](/assets/4x4-2k-min.png)

## About this Project
This APP was born from the need to digitize and accelerate the access of data of the
members to the movement. Various activities, such as meetings of occupants, needed
contact by phone and searching for this data on paper cards was time consuming.

## Built with ❤️ and
- [Firebase](https://firebase.google.com/)
- [Next.js](https://github.com/vercel/next.js) (optimized to run without the next.js server on production)
- [React-Fitty](https://github.com/morhogg/react-fitty)
- [React-Query](https://github.com/tannerlinsley/react-query)
- [Mobx](https://github.com/mobxjs/mobx)
- [Material-UI](https://github.com/mui-org/material-ui)

## Requirements
- [Firebase CLI](https://github.com/firebase/firebase-tools) You'll use firebase cli to run emulators that is needed to run local dev server, local tests and deploy the app.<br/></br>
- [Yarn](https://yarnpkg.com/) Manage the multi repository arch of this project using **yarn workspaces**.<br/></br>
- [Firebase Blaze plan](https://firebase.google.com/pricing) to deploy, it's needed to run Firebase Functions, but have a free tier.

## Backend features
Some features need to be server side to reduce the number of Firestore reads ( like statistics )
and to ensure secure handling of data.

- Multiple Administrators
  - Invite new users (by email) to be Editors and Administrators
  - Auto removal unused/expired invites
  - Administrators can manage all accounts except first one's that's locked and configured in .env.local > APP_ADMIN_EMAILS
- Statistics
  - Compute the total number of Occupations and Affiliates
  - Compute the total number of affiliates birthdays on current month
  - Compute the number of affiliates per occupation
- Show upcoming affiliates birthdays per Occupation
- Attachments are automatically removed from Occupations and Affiliates when they are deleted
- Automatic relation update on when an Occupation related to some affiliates are removed docs

## Configuration
### .env.local
In the project's root folder rename the file .env.local.example to .env.local<br />
and add the following variables:

- **APP_ADMIN_EMAILS** - the only one required<br />
  The initial admin emails that will be auto recognized by the auth system as Administrators.<br />
  You can put several emails on that list, as long as they are separated by a comma.<br /></br>

- **APP_DOMAIN** - optional<br />
  The app domain that will appear on invited users emails.<br /><br />

- **APP_MAIL_SOURCE** - optional<br />
  The email source you registered with AWS ses to send system emails.<br/><br/>

- **AWS_SES_ACCESS_KEY** - optional<br />
  Aws credentials to send the system emails.<br /><br/>

- **AWS_SES_SECRET_ACCESS_KEY** - optional<br />
  Aws credentials to send the system emails.

### /.firebaserc
Use the [Firebase cli "use" command](https://firebase.google.com/docs/cli#add_alias) `firebase use` to update the project name before building and deploying the project production

### Firebase hosting redirects
We made a custom script to map next.js routes in firebase.json, so you need to write custom redirects in firebase hosting you need to write that redirects in firebaseHostingRewrites.js


## Backend serverless functions
### Users Management -> packages/functions/src/usersFunctions.ts
- [x] onCreateUser
  - Firebase don't have a way to apply constraints on user registration,
  so every created account that don't have an invitation will be removed 
  just after the register (fortunately the frontend is capable to detect that)

- [x] changeRole - https endpoint
  - Change user role on customClaims, the targeted role can be Administrator and Content Editor

- [x] deleteUser - https endpoint
  - Users with Administrator role can use that callable function to delete a user
    

### Affiliates -> packages/functions/src/affiliatesFunctions.ts
- [x] onCreateAffiliate
  - Compute statics about total number off affiliates
    and number of affiliates on each occupation
  
- [x] onUpdateAffiliate
  - Update computed statistics
  
- [x] onDeleteAffiliate
  - Update computed statistics to not count with that affiliate removed
  
### Attachments -> packages/functions/src/attachmentsFunctions.ts
- [x] onDeleteAttachment
  - Attachments deleted from Firestore will run that function to remove the real file from Firebase Storage

### Invites new Editors and Administrators -> packages/functions/src/invitesFunctions.ts
- [x] onCreateInvite
  - Send email to user invited informing him that he was asked to manage the system data

- [x] deleteExpiredInvites
  - A cron function that run every 24 hours to delete expired invites
  (expired invitations are invitations that are older than 72 hours)

### Occupations -> packages/functions/src/occupationsFunctions.ts
- [x] onCreateOccupation
  - Compute general statistics
  
- [x] onDeleteOccupation
  - Compute general statistics
  - Remove occupation relation on affiliates
  - Delete all attachments attached to that Occupation
  
## But not least
- All integration tests will run on port 3000 (next.js server)
- If you need to use the Firebase Hosting Emulator you need to first build the frontend using the command: `yarn build:front`

## Available Commands
In the project directory, you can run:

### `yarn deploy`
Build front and backend and deploy all functions and hosting files to firebase.

### `yarn start` - shortcut of `yarn dev && yarn emulators`

Runs the app in the development mode, this will start next.js server and firebase emulators.<br />
open [http://localhost:3000](http://localhost:3000) to view it in the browser.
you can also open [http://localhost:4000](http://localhost:3000) to view firebase emulators-ui in the browser.

The page will reload if you make edits.<br />

### `yarn emulators`
Launches the firebase emulators

### `yarn test`
Run all unit tests.<br />

### `yarn test:integration`
Run all integration tests.<br />

### `yarn build` - shortcut of `yarn build:front && yarn build:functions`

Builds the whole app for production.<br />
It bundles React in production mode and optimizes the build for the best performance.<br />
It also build the backend functions in production mode.

The build is minified and the filenames include the hashes to avoid browser cache when a new version is released.<br />
Your app is ready to be deployed!

You can also deploy only frontend with `firebase deploy --only hosting` see https://firebase.google.com/docs/hosting/manage-hosting-resources for more details.