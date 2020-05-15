OUTPUT=$(node build/createUser.js)
if [ $? -eq 0 ]; then
  if [ $(wc -l < .env) -gt 1 ]; then
    # Remove all lines except the first from file.
    # See https://www.folkstalk.com/2013/03/sed-remove-lines-file-unix-examples.html
    sed -i '2,$d' .env
  fi
  for item in $OUTPUT
  do
    echo $item >> .env
  done
else
  echo $OUTPUT
fi
