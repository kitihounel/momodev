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
