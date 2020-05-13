# momodev-api-user
NodeJS scripts to help testing MTN MoMo API.

# First step
Start by running `npm run build` to compile the source files.
This will create a `build` directory with the scripts.

## Create User
Create a `.env` file in the root directory with your primary
subscription key then run `node build/createuser.js`.
The API user and key generated will then be printed in the console.

You can  append the result to your `.env` file if the script was successful.
An `update-env.sh` script is provided for that. Here is its content.

## Get Authorization Token
To generate authorization token, use the `update-token.sh` script.
The token will be saved in the `.env` file. Tokens are valid for one hour.

## Request to pay
