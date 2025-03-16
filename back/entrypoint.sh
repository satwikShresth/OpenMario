#!/bin/sh

deno task migrate
deno task seed
deno task start
#
# # if [ "${ENV}" = "development" ]; then 
#   deno task watch
# # else
# #   deno task start
# # fi
# #["deno", "run", "--allow-net", "src/server.ts"]
