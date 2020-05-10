# momodev-api-user
NodeJS scripts used to help in testing MoMo API.

## How to Use
Put in the `.env` file your primary subscription key then run `node main.js`.
The API user and key generated will then be printed in the console.

```
$ node main.js
```

You can  append the result to your `.env` file if the script was successful.
An `update-env.sh` script is provided for that. Here is its content.

```
OUTPUT=$(node main.js)
if [ $? -eq 0 ]
then
    for item in $OUTPUT
    do
        echo $item >> .env
    done
else
    echo $OUTPUT
fi
```
