#!/bin/sh
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 source_directory" >2
  exit 1
fi


if [ -z "$DEPLOY_URL" ]; then
  echo 'Action did not find the DEPLOY_URL variable.' >2
  exit 1
fi

if [ -z "$DEPLOY_KEY" ]; then
  echo 'Action did not find the DEPLOY_KEY secret.' >2
  exit 1
fi

if [ -z "$DEPLOY_KNOWN_HOSTS" ]; then
  echo 'Action did not find the DEPLOY_KNOWN_HOSTS secret.' >2
  exit 1
fi

SSH_PATH="$HOME/.ssh"
SSH_OPTS="-i \"$SSH_PATH/deploy_key\""

mkdir -p "$SSH_PATH"
touch "$SSH_PATH/deploy_key"
touch "$SSH_PATH/known_hosts"

chmod 700 "$SSH_PATH"
chmod 600 "$SSH_PATH/known_hosts" "$SSH_PATH/deploy_key"

printf '%b\n' "$DEPLOY_KEY" > "$SSH_PATH/deploy_key"
printf '\n%s\n' "$DEPLOY_KNOWN_HOSTS" >> "$SSH_PATH/known_hosts"

exec rsync -avz --checksum --delete-after \
  -e "ssh $SSH_OPTS" \
  "$GITHUB_WORKSPACE/$1/" \
  "$DEPLOY_URL"