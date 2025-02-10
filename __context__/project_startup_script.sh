#!/bin/bash

echo "pnpm install ……"
pnpm install

echo "pnpm run dev ……"
npm run dev -- --hostname=0.0.0.0 --port=8888

echo "Next.js application is running on http://0.0.0.0:8888"

# Keep container running
tail -f /dev/null