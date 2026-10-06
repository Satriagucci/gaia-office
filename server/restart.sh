#!/bin/bash
for p in /proc/[0-9]*; do
  if tr '\0' ' ' < "$p/cmdline" 2>/dev/null | grep -q "server/index.js"; then
    pid=$(basename "$p")
    kill -9 "$pid" 2>/dev/null
  fi
done
rm -f /tmp/gaia-server.log /tmp/gaia.log
sleep 1
cd /home/hermes/gaia-vault/gaia-office
nohup node server/index.js > /home/hermes/gaia-server.log 2>&1 &
sleep 2
curl -s http://localhost:8788/api/runner/status
