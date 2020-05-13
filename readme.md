# momodev-api-user
NodeJS scripts to help testing MTN MoMo API.

# First step
Start by running `npm run build` to compile the source files.
This will create a `build` directory with the scripts.

## Create user
Create a `.env` file in the root directory with your primary
subscription key then run `node build/createuser.js`.
The API user and key generated will then be printed in the console.

```
$ node build/createuser.js
```

You can  append the result to your `.env` file if the script was successful.
An `update-env.sh` script is provided for that. Here is its content.

```
OUTPUT=$(node build/createuser.js)
if [ $? -eq 0 ]; then
  if [ $(wc -l < .env) -eq 3 ]; then
    # Remove last two lines from file.
    # See https://www.folkstalk.com/2013/03/sed-remove-lines-file-unix-examples.html
    sed -i '2,3d' .env
  fi
  for item in $OUTPUT
  do
    echo $item >> .env
  done
else
  echo $OUTPUT
fi
```

## Request to pay
