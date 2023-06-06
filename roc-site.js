#!/usr/bin/env node

const process = require('process');
const program = require('commander');
const fs = require('fs/promises');
const path = require('path');
const ROCrate = require("ro-crate").ROCrate;
//const _ = require("lodash");
const {segmentPath, getLink} = require("./lib/rendering");
const {renderPage} = require('./lib/display');
const renderNew = require('./defaults/static_template.js');
const StaticUtils = require('./lib/static_utils');
const GeoJSON = require("geojson");
const Preview = require("./lib/ro-crate-preview");
const HtmlFile = require("./lib/ro-crate-preview-file");



const CratePruner = require('./lib/prune-crate');


program
  .version(require('./lib/version').version)
  .description(
    "Extracts data from a spreadsheet to make an RO crate"
  )
  .arguments("<d>")
  .option("-c, --config [conf]", "configuration file")
  .option("-s,  --cratescript [cratescript]", "URL of Crate-script")
  .option("-r, --output-path [rep]", "Directory into which to write output", null)
  .action((d) => {crateDir = d})


program.parse(process.argv);
const outPath = program.outputPath ?  program.outputPath : crateDir;

async function makeRepo(outPath) {
    await fs.mkdir(outPath, {recursive: true});
  }


  

function indexByType(crate, config) {
    const types = {}
    for (let item of crate.getGraph()) {
        if (!(item["@id"] === "./" || item["@id"].match(/^ro-crate-metadata.json$/))){
            for (t of crate.utils.asArray(item["@type"])) {
                if (config.collectionTypes.includes(t)) {
                    if (!types[t]) {
                        types[t] = [item];
                    } else {
                        types[t].push(item);
                    }
                }
            }
        }
    }
    return types;
}


async function main(file) {
    repo = await makeRepo(outPath);
    const config = JSON.parse(await fs.readFile(program.config, 'utf8'));
    if (program.cratescript) {
        config.renderScript = program.cratescript;
    }
    config.utils = new StaticUtils(); // Functions for paths etc
    // load the crate
    const crate = new ROCrate(JSON.parse(await fs.readFile(path.join(crateDir, "ro-crate-metadata.json"), 'utf8')));
    crate.index();
    crate.addBackLinks();
    repoRoot = crate.getRootDataset();
    // Need to have context loaded
    await crate.resolveContext();
    
    const Pruner = new CratePruner(crate, config);
    const repoCrate = Pruner.prune(repoRoot);

    repoCrate.context = crate.context;
    repoCrate.index();
    repoRoot = repoCrate.getRootDataset();    
    repoRoot.hasPart = [];
    repoCrate._relPath = "./";

    const types = indexByType(crate, config);
    
    for (let type of Object.keys(types)) {
        const collection = 
                {"@id": `#type:${type}`,
                "@type": "RepositoryCollection",
                "name" : `${type} Collection`,
                "hasMember": []
            }
        repoCrate.addItem(collection);
        repoRoot.hasPart.push({"@id": collection["@id"]});

        for (let item of types[type]) {
            console.log("Processing", item.name)
            var itemCrate
            
            const Pruner1 = new CratePruner(crate, config);
            itemCrate = Pruner1.prune(item);
            itemCrate.context = crate.context;
            const itemCrateRoot = itemCrate.getRootDataset();
            //itemCrateRoot["@reverse"] = []; 
            itemCrateRoot.name = item.name;
            itemCrate._relPath = segmentPath(item["@id"]);
            itemCrate._dirPath = path.join(outPath, itemCrate._relPath)
            itemCrate.addBackLinks();
        
            // Paths and directory setup
            await fs.mkdir(itemCrate._dirPath, {recursive: true});
            itemCrate._htmlpath = path.join(itemCrate._dirPath, "ro-crate-preview.html");
            itemCrate._relHtmlpath = path.join(itemCrate._relPath, "ro-crate-preview.html");
            
            // TODO - remove this displayable item stuff and make the place finding stuff work with crates 
            var template;
            if (config.types[type] && config.types[type].template){
                template = require( path.join(process.cwd(), path.dirname(program.config), config.types[type].template));
            } else {
                template = renderPage;
            }
            if (config.types[type] && config.types[type].findPlaces){
                findPlaces = require( path.join(process.cwd(), path.dirname(program.config), config.types[type].findPlaces));
                places = findPlaces(item, itemCrate);
            } else {
                places = {};
            }
            const preview = new Preview(itemCrate, config);
            // ATM the only thing we're relying on config for is config.types to tell it what types get their own pages
            preview.places = places; // TODO make this work with GeoJSON
            const html = await renderNew(item["@id"], preview);
            await fs.writeFile(path.join(itemCrate._dirPath, "ro-crate-metadata.json"), JSON.stringify(itemCrate.getJson(), null, 2))
            await fs.writeFile(itemCrate._htmlpath, html)

            // Add item to relevant collection
            collection.hasMember.push({"@id": item["@id"]});
            repoCrate.addItem({"@id": item["@id"], "name": item.name, "@type": type});

        }
    }

    const previewAll = new Preview(repoCrate, config);
    const html = await renderNew("./", previewAll);

    await fs.writeFile(path.join(outPath, "ro-crate-preview.html"), html);
   

}

main(crateDir);








//console.log(module);


