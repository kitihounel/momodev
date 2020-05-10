OUTPUT=$(node createuser.js)
if [ $? -eq 0 ]
then
    for item in $OUTPUT
    do
        echo $item >> .env
    done
else
    echo $OUTPUT
fi
