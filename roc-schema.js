#!/usr/bin/env node


const program = require('commander');
const fs = require('fs/promises');
const path = require('path');
const ROCrate = require("ro-crate").ROCrate;
const commonmark = require("commonmark");
//const _ = require("lodash");
const { valHooks } = require('jquery');
//const { defaultsDeep } = require('lodash');



program
  .version(require('./lib/version').version)
  .description(
    "Extracts a markdown or HTML page from an RO Crate containing Schema.org style Classes and Properties "
  )
  .arguments("<d>")
  .option("-c, --config [conf]", "configuration file")
  .option(
    "-h,  --html", "Output HTML (default is markdown)"
  ) 
  .option(
    "-t,  --ro-crate-terms", "Output vocabulary and context file for RO-Crate terms"
  )
  .option(
    "-u,  --url [url]", "URL for the final result (so links can be made relative)"
  )
  .option("-o, --output-path [rep]", "Directory into which to write output", null)
  .action((d) => {crateDir = d})


program.parse(process.argv);
const outPath = program.outputPath ?  program.outputPath : "./";




async function main() {
    var md = ""
    const crate = new ROCrate(JSON.parse(await fs.readFile(path.join(crateDir, "ro-crate-metadata.json"))));
    await crate.resolveContext();
    const url = program.url || "";
   
    function formatValue(val) {
      var links = "";

      for (let v of crate.utils.asArray(val)){
        if(v["@id"]) {
          links += `<a href='${crate.resolveTerm(v["@id"]).replace(url, "")}'> ${v["@id"]} </a>`
        } else {
          links += ` ${v} `;
        }
      }
      return links;
    }

    function clean(val) {
      var links = "";

      for (let v of crate.utils.asArray(val)){
        if(v["@id"]) {
          links += `${v["@id"]}`;
        } else {
          links += `${v}`;
        }
      }
      return `"${links.replace(/"/g, '""').replace(/\n/g, " ")}"`

    }

    vocab =  []
    context = {"@context": ""}
    innerContext = context["@context"]

    for (let item of crate.getGraph()) {
          if (crate.utils.asArray(item["@type"]).includes("rdf:Property")) {
              md += `<div id="${item["rdfs:label"]}">\n\n`;
                      md += `# Property: ${item["rdfs:label"]}\n\n`;
                      md += `${item["rdfs:comment"]}\n\n`;
                      md += `## Values expected to be one of these types: \n\n`;
                      md += `${formatValue(item.rangeIncludes)}\n\n`;
                      md += `## Used on these types: \n\n`;
                      md += `${formatValue(item.domainIncludes)}\n\n`;
              md += `</div>\n`;
              
              
              
              vocab.push({
                term: clean(item.name),
                type: "Property",
                label: clean(item["rdfs:label"]),
                description: clean(item["rdfs:comment"]),
                domain: clean(item.domainIncludes),
                range: clean(item.rangeIncludes)

              })

          } else if (crate.utils.asArray(item["@type"]).includes("rdfs:Class")) {

            md += `<div id="${item["rdfs:label"]}">\n\n`;
                    md += `# Class: ${item["rdfs:label"]}\n\n`;
                    md += `${item["rdfs:comment"]}\n\n`;
                    md += `## Subclass of \n\n  ${formatValue(item["rdfs:subClassOf"])}\n\n`;

                    
            md += `</div>\n`;

            vocab.push({
              term: clean(item.name),
              type: "Class",
              label: clean(item["rdfs:label"]),
              description: clean(item["rdfs:comment"]),
              domain: clean(item.domainIncludes),
              range: clean(item.rangeIncludes)
            })
            

        }
      }
  
    if (program.roCrateTerms) {
      output = "term,type,label,description,domain,range\n";
      for (let v of vocab) {
        output += `${v.term},${v.type},${v.label},${v.description},${v.domain},${v.range}\n`
      }
      await fs.writeFile(path.join(outPath,"vocabulary.csv"), output);
    }
    if (program.html) {
        const reader = new commonmark.Parser();
        const writer = new commonmark.HtmlRenderer();
        const parsed = reader.parse(md); 
        const result = writer.render(parsed); // result is a String
             console.log(result);
        } else {
             console.log(md);
    }
    
  }

main();

