# Homework 1: REST Api for sqlite db interactions and React frontend

## Step 1: Installing Deno and npm

Install Deno because this project uses deno as its runtime, I took prior permission from Prof. Long for this, here is the link to do it if you havent
[DENO](https://deno.com)


## Step 2: Running the backend

I have tried running it and it has worked for me, I have make it work in a certain way so it suits my dev process

Commands are exaclty same as of npm

```bash

# Common
git clone <your-repo>
cd <your-repo>


# npm command required
# npm i # install dependencies
# npm run setup # set up your SQLite database
# npm run build # compile your server
# npm run start # start your server
#
# in another terminal...
# npm run test # run your tests

# Since this project is build using deno
deno install # install dependencies

# using task command is recommened, but also works with run
deno task setup # set up your SQLite database
deno task build # TS checks your server Since deno can directly run a .ts file
deno task seed # I have added some seed data so that we are able to search nicely
deno task start # start your server

deno task test # run your tests
```

## Step 2: Running the frontend


```bash

npm i # install dependencies
npm run dev # start your server
```
