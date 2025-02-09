#!/bin/sh

deno install --allow-scripts
deno task setup
deno task seed

if [ "${ENV}" = "development" ]; then 
  deno task dev
else
  deno task start
fi
