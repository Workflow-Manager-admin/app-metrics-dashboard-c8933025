#!/bin/bash
cd /home/kavia/workspace/code-generation/app-metrics-dashboard-c8933025/frontend_react_vite
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

