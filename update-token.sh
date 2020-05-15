# The following links helps me a lot while writing this script.
# Parse a .env (dotenv) file directly using Bash - https://gist.github.com/judy2k/7656bfe3b322d669ef75364a46327836
# Curl, accept self-signed certificate - https://unix.stackexchange.com/questions/60750/
# Curl, send credentials on redirection - https://stackoverflow.com/questions/37865875/
# Remove last char from string in Bash - https://unix.stackexchange.com/questions/144298/
# Parse JSON with Unix tools - https://stackoverflow.com/questions/1955505/

export $(egrep -v '^#' .env | xargs)

OUTPUT=$(curl --location-trusted --insecure --request POST --silent \
              --user ${API_USER}:${API_KEY} \
              --header "Ocp-Apim-Subscription-Key: ${SUBSCRIPTION_KEY}" \
              --header "Content-Length: 0" \
              "https://sandbox.momodeveloper.mtn.com/collection/token" \
)

TOKEN=$(echo $OUTPUT | jq -r ".access_token")

if [ "${TOKEN}" != "null" ]; then
  if [ $(wc -l < .env) -gt 3 ]; then
    sed -i '$d' .env
  fi
  echo "TOKEN=${TOKEN}" >> .env
else
  echo "Token request failed"
  echo "Server response: ${OUTPUT}"
fi
