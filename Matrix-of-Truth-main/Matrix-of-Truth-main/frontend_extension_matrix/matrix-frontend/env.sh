#!/bin/sh

# Recreate config file
rm -rf /usr/share/nginx/html/env-config.js
touch /usr/share/nginx/html/env-config.js

# Add assignment
echo "window.env = {" >> /usr/share/nginx/html/env-config.js

# Read each line in .env file
# Each line represents key=value pairs
printenv | grep '^VITE_' | while read -r line; do
  # Split env variables by character `=`
  varname=$(echo "$line" | cut -d '=' -f 1)
  varvalue=$(echo "$line" | cut -d '=' -f 2-)

  # Append configuration property to JS file
  echo "  $varname: \"$varvalue\"," >> /usr/share/nginx/html/env-config.js
done

echo "};" >> /usr/share/nginx/html/env-config.js
