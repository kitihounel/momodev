OUTPUT=$(node build/createtoken.js)
if [ $? -eq 0 ]; then
  if [ $(wc -l < .env) -gt 3 ]; then
    sed -i '$d' .env
  fi
  echo $item >> .env
else
  echo $OUTPUT
fi
