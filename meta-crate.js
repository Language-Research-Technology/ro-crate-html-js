#!/usr/bin/env node

/*
Creates a "Meta Crate" that contains other crates
*/

const program = require('commander');
const fs = require('fs/promises');
const path = require('path');
const Preview = require("ro-crate").Preview;
const HtmlFile = require("ro-crate").HtmlFile;
const ROCrate = require("ro-crate").ROCrate;

program
  .version(require('./lib/version').version)
  .description(
    "Creates a meta-crate that wraps up other crates"
  )
  .arguments("<d>")
  .option("-c,  --cratescript [cratesript]", "URL of Crate-script directory")
  .option("-d, --directory [dir]", "Data directory which should contain crates as sub directories")
  .option("-n, --name [name]", "Name for this crate", "Untitled")
  .option("-t, --description [description]", "Description for this crate", "No description provided")
  .option("-u, --url [url]", "URL to prepend to crate IDs", "https://data.research.uts.edu.au/examples/ro-crate/examples/src/")

  .action((d) => { crateDir = d; });


program.parse(process.argv);

async function main(program) {
  //const date = Date.now().toISOString();
  const date = "";
  console.log(date);
  const promises = [];
  const crate = new ROCrate();
  crate.index();
  const root = crate.getRootDataset();
  root.name = program.name;
  root.description = program.description;
  const metadataFilename = "ro-crate-metadata.json";

  root.hasPart = [];
  for (let d of await fs.readdir(program.directory)) {
    console.log(d);
    var p = path.join(program.directory, d, metadataFilename);
    const id = `${program.url}${d}/`;
    console.log(p);
    let content;
    try {
      content = await fs.readFile(p, "utf8");
    } catch (error) {
      try {
        content = await fs.readFile(`${p}ld`, "utf8");
      } catch (error) {
      }
    }
    if (content) {
      console.log("Found:", p);
      const json = JSON.parse(content);
      const c = new ROCrate(json);
      c.index();
      r = c.getRootDataset();
      part = {
        "@type": "Dataset",
        "name": r.name,
        "description": r.description,
        "@id": id
      };
      crate.addItem(part);
      root.hasPart.push({ "@id": part["@id"] });
    }
  }
  await fs.writeFile(path.join(program.directory, metadataFilename), JSON.stringify(crate.getJson(), null, 2));
  const preview = new Preview(crate);
  const f = new HtmlFile(preview);
  const newPath = path.join(
    program.directory,
    crate.defaults.roCratePreviewFileName
  );
  fs.writeFile(newPath, await f.render("", program.cratescript));

}


main(program);
