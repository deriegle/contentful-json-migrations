#!/usr/bin/env node

const fs = require("fs");
const App = require("./src/index");

const argv = require("yargs")
  .command(
    "create:migrations [JSON file]",
    "Create migrations from the JSON file diff",
    args => {
      args.positional("path", {
        describe: "path to json file with migrations in it",
        default: "migrations.json"
      });
    }
  )
  .demandCommand()
  .help();

const path = argv.path;

if (!fs.existsSync(path)) {
  throw new Error("Path is invalid.");
}

if (!path.endsWith(".json")) {
  throw new Error("File must be a JSON file");
}

const currentMigrations = require(path);

// pull from contentful/pass in contentful params to pull down contentful data
App({}, currentMigrations);
