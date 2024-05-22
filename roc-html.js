#!/usr/bin/env node

/*
This is part of RO-Crate-js Copyright (C) 2019  University of Technology Sydney

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without evxen the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
var paths = undefined;
const path = require("path");

const Preview = require("./lib/ro-crate-preview");
const HtmlFile = require("./lib/ro-crate-preview-file");
const { ROCrate } = require("ro-crate");

const program = require("commander");
const defaults = require("./lib/defaults.js");
const fs = require("fs");

async function render(metadataPath, zip, script) {
    const potentialPath = path.join(metadataPath, defaults.roCrateMetadataID);
    var content;
    try {
      content = fs.readFileSync(potentialPath, 'utf8');
    } catch (error) {
      content = fs.readFileSync(metadataPath, 'utf8');
    }
    json = JSON.parse(content);
    const crate = new ROCrate(json);
    const preview = new Preview(crate);
    const f = new HtmlFile(preview);
    newPath = path.join(
        path.dirname(metadataPath),
        defaults.roCratePreviewFileName
    );
    fs.writeFileSync(newPath, await f.render(zip, script));
}

program
    .description("Generates an HTML previewfor a Res earch-Object crate")
    .arguments("<files...>")
    .action(function (files) {
        paths = files;
    }).option("-c,  --cratescript [cratesript]", "URL of Crate-script");

program.parse(process.argv);
const cratescript = program.cratescript || defaults.render_script;
if (!program.rawArgs.length || !paths) program.help();

for (let p of paths) {
    render(p, cratescript);
}
