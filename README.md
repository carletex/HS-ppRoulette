# HS-ppRoulette

Pair programming roulette for HS.

## Prerequisites

You must install [nodejs](http://nodejs.org/), [npm](https://github.com/npm/npm) and [mongodb](http://www.mongodb.org/) in your system.

## Install

Install the package with npm:

`npm install git+https://github.com/carletex/HS-ppRoulette`

## Usage

1. Create a Hacker School app using `http://127.0.0.1:8000` as a redirect URI
2. Create a Zulip bot
3. Create a `keys.sh` file and put the following values:

   ```bash
   export TOKEN_SECRET='<a_random_string>'
   export MONGO_URI='<your_mongo_db_url (e.g. mongodb://localhost/databasename)>'
   export HS_SECRET='<your_hackerschool_app_consumer_secret>'
   export ZULIP_EMAIL='<zulip_bot_email>'
   export ZULIP_SECRET: '<zulip_bot_secret>'
   ```
4. Put those variables in your environment with `$ source keys.sh`
5. In `client/app.js` set `clientID: '<your_hackerschool_app_client_id>'` (line 9) and `redirectUri: 'http://127.0.0.1:8000'` (line 11)
6. Run `node server` and visit http://127.0.0.1:8000 in your browser
