#!/usr/bin/env node

const fs = require("fs");
const App = require("./src/index");

require("yargs")
  .scriptName("Contentful JSON migrations")
  .usage("$0 <cmd> [args]")
  .command(
    "create:migrations [filePath]",
    "Create migrations from diff in JSON file",
    yargs => {
      yargs.positional("filePath", {
        type: "string",
        default: "./migrations.json",
        describe: "the file path to the JSON migration file"
      });
    },
    function(argv) {
      const path = argv.filePath;

      if (!fs.existsSync(path)) {
        throw new Error("Path is invalid.");
      }

      if (!path.endsWith(".json")) {
        throw new Error("File must be a JSON file");
      }

      try {
        const currentLocalMigrations = require(path);

        // Get from Contentful using CLI (Downloading to JSON file) or get using API
        const currentContentfulMigrations = {
          contentTypes: []
        };

        App(currentContentfulMigrations, currentLocalMigrations);
      } catch (e) {
        console.error(e);

        throw new Error("Could not parse JSON file");
      }
    }
  )
  .help().argv;
