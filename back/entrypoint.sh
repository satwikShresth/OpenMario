#!/bin/sh

deno task db:migrate:push
deno task db:seed

# if [ "${ENV}" = "development" ]; then 
  deno task watch
# else
#   deno task start
# fi
