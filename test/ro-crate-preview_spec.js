/* This is part of Calcyte a tool for implementing the DataCrate data packaging
spec.  Copyright (C) 2018  University of Technology Sydney

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import * as assert from "assert";
import Preview from '../src/ro-crate-preview-wrapper.js';
import HtmlFile from '../src/ro-crate-preview-file.js';
import StaticPathUtils from "../lib/static_utils.js";
import {ROCrate} from "ro-crate";
import fs from "fs";
import * as chai from "chai";
// chai.use(require("chai-fs"));
import render from "../defaults/static_template.js"

describe("single item rendering", function () {
  it("should create a simple table", async function () {
    this.timeout(5000);
    const json = JSON.parse(
      fs.readFileSync("test_data/sample-ro-crate-metadata.json", 'utf8')
    );
    const crate = new ROCrate(json);
    const preview = new Preview(crate, { utils: new StaticPathUtils() });
    const table = await preview.renderMetadataForItem(preview.rootId);
    assert.equal(
      table.match(/<\/tr>/g).length,
      16,
      "Has the right number of rows"
    );
  });
});


describe("Single static page", function () {
  it("should create a static page uisng the default template", async function () {
    this.timeout(5000);
    const json = JSON.parse(
      fs.readFileSync("test_data/sample-ro-crate-metadata.json", 'utf8')
    );
    const crate = new ROCrate(json);
    crate.index();
    const preview = new Preview(crate, { utils: new StaticPathUtils() });
    // const renderPage = require('../defaults/static_template.js');

    const page = render("./", preview);
    //await fs.writeFile("test.html", page);
    assert.equal(
      page.match(/<table/g).length,
      22,
      "Has the right number of tables for what's in the crate"
    );

  });
});

describe("metadata summary", function () {
  this.timeout(5000);

  it("should create multipe metadata tables", async function () {
    const json = JSON.parse(
      fs.readFileSync("test_data/sample-ro-crate-metadata.json", 'utf8')
    );
    const preview = new Preview(new ROCrate(json));
    const div = await preview.summarizeDataset();
    assert.equal(
      div.match(/table/g).length,
      32,
      "Has the right number of summary tables"
    );
  });
});

describe("actual file", function () {
  it("should create an html file", async function () {
    const json = JSON.parse(
      fs.readFileSync("test_data/sample-ro-crate-metadata.json", 'utf8')
    );
    const preview = new Preview(new ROCrate(json));
    const f = new HtmlFile(preview);
    const html = await f.render();
    // Worst test ever
    assert.equal(html.search(/^\s+<html>/), 0);
  });
});


describe("render a file", function () {
  it("should create a file", async function () {
    const json = JSON.parse(
      fs.readFileSync("test_data/sample-ro-crate-metadata.json", 'utf8')
    );
    const preview = new Preview(new ROCrate(json));
    const f = new HtmlFile(preview);
    fs.writeFileSync("test.html", await f.render());
    fs.rmSync("test.html");
  });
});

describe("val.match bug with integer ContentSize", function () {
  it("should create a file from an ro-crate with an integer value", async function () {
    const json = JSON.parse(
      fs.readFileSync("test_data/sample-ro-crate-metadata-integer.json", 'utf8')
    );
    const preview = new Preview(new ROCrate(json));
    const f = new HtmlFile(preview);
    fs.writeFileSync("test.html", await f.render());
    fs.rmSync("test.html");
  });
});

after(function () {
});
