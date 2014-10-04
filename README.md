# HS-ppRoulette (WIP)

Pair programming roulette for HS

## Install

Install the package with npm:

`npm install git+https://github.com/carletex/HS-ppRoulette`

## Usage

1. Create a Hacker School app using `http://127.0.0.1:8000` as a redirect URI
2. Create a `keys.sh` file and put the following values:

   ```bash
   export TOKEN_SECRET='<a random string>'
   export HS_SECRET='<your_hackerschool_app_consumer_secret>'
   ```
3. Put those variables in your environment with `$ source keys.sh`
4. In `client/app.js` set `clientID: '<your_hackerschool_app_client_id>'` and `redirectUri: 'http://127.0.0.1:8000'`
5. Run `node server` and visit http://127.0.0.1:8000 in your browser
