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


const assert = require('assert');
const Page = require('../lib/paginate');
const chai = require('chai');
chai.use(require('chai-fs'));
const ROCrate = require("ro-crate").ROCrate;
const fs = require("fs");


describe('Paginating', function () {
    it('Does basic page nesting', function () {
        const crate = new ROCrate();
        crate.index();
        crate.addItem({"@id": "1", "name": "Singleton" });
        const root = crate.getRootDataset()
        let hasPart = root.hasPart = [{"@id": "1"}];
        const page = new Page({"values": root.hasPart});
        console.log(page.values);
        for (let i = 2;  i < 20; i++) {
            crate.addItem({"@id": `${i}`, "name": `item ${i}` });
            //root.hasPart.push({"@id": `${i}`});
            hasPart.push({"@id": `${i}`});
        }
        root.hasPart = hasPart;
        const page20 = new Page({"values": root.hasPart});
        console.log("values", page20.values);
        console.log("pages", page20.pages);

        for (let i = 20;  i < 80; i++) {
            crate.addItem({"@id": `${i}`, "name": `item ${i}` });
            //root.hasPart.push({"@id": `${i}`});
            hasPart.push({"@id": `${i}`});
        }
        root.hasPart = hasPart;
        const page80 = new Page({"values": root.hasPart});
        console.log("values", page80.values);
        console.log("pages", page80.pages);

    });
    it('Can deal with real scale', function () {
        const json = JSON.parse(fs.readFileSync("test_data/convictions-metadata.json"));
        crate = new ROCrate(json);
        crate.index();
        const root = crate.getRootDataset();
        const page = new Page({values: root.hasMember, pageSize: 30});
        console.log("pages", page.pages);
        console.log(page.pages[0].pages[0]);

    });
});

