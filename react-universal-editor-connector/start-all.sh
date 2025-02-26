#!/usr/bin/env bash

###################################
# 0. A trap to catch Ctrl+C (SIGINT)
###################################
cleanup() {
  echo
  echo "Stopping all background processes..."
  # Kill all the processes we started specifically, so the script itself
  # isn't killed prematurely (which can happen with 'kill 0').
  kill "$AEM_PID" "$UES_PID" "$SSL_1_PID" "$SSL_2_PID" "$REACT_PID" 2>/dev/null

  echo "Waiting for AEM to fully stop..."
  # Loop until AEM no longer responds on port 4502
  while true; do
    STATUS=$(curl -s -u admin:admin -o /dev/null -w "%{http_code}" http://localhost:4502/)
    # When AEM process is truly down (no socket listening), curl returns code "000"
    if [ "$STATUS" = "000" ]; then
      echo "AEM is down (HTTP code $STATUS)."
      break
    else
      echo "AEM responded with $STATUS, still shutting down..."
    fi
    sleep 5
  done

  echo "All processes have been stopped."
  exit 0
}

# When script receives Ctrl+C (SIGINT), call cleanup()
trap cleanup INT

########################################
# 1. Start AEM in the background
########################################
echo "Starting AEM Author..."
cd ~/aem-sdk/author

java -jar aem-author-p4502.jar &
AEM_PID=$!

echo "Waiting for AEM to start..."

while true; do
  STATUS=$(curl -s -u admin:admin -o /dev/null -w "%{http_code}" http://localhost:4502/)
  echo "HTTP code: $STATUS"
  
  if [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ]; then
    echo "AEM responded with $STATUS; continuing..."
    break
  fi
  sleep 5
done

sleep 5
echo "AEM (PID $AEM_PID) is up and running!"

########################################
# 2. Start Universal Editor Service
########################################
echo "Starting Universal Editor Service (UES)..."
cd ~/aem-sites-ax-eds/react-universal-editor-connector/universal-editor-service

node universal-editor-service.cjs &
UES_PID=$!

echo "UES (PID $UES_PID) started."

########################################
# 3. Start SSL Proxies
########################################
echo "Starting SSL proxies..."
local-ssl-proxy --source 8443 --target 4502 &
SSL_1_PID=$!

local-ssl-proxy --source 8001 --target 8000 &
SSL_2_PID=$!

echo "SSL proxies started with PIDs $SSL_1_PID and $SSL_2_PID."

########################################
# 4. Start local React app
########################################
echo "Starting local React app..."
cd ~/aem-sites-ax-eds/react-universal-editor-connector

npm start &
REACT_PID=$!

echo "React (PID $REACT_PID) started."

########################################
# 4a. Delay and then open UES cloud in default browser
########################################
sleep 5
TARGET_URL="https://experience.adobe.com/#/@deloitteemeasouthpartnersdbx/aem/editor/canvas/localhost:3000/"
echo "Opening new tab in default browser to: $TARGET_URL"

case "$OSTYPE" in
  darwin*) open "$TARGET_URL" ;;
  linux*)  xdg-open "$TARGET_URL" ;;
  *)       echo "Please open the following URL manually: $TARGET_URL" ;;
esac

########################################
# 5. Keep the script running
########################################
echo
echo "All services started in the background."
echo "Press Ctrl+C to stop everything..."
echo

wait