/* 

This is part of ro-crate-html-js a tool for generating HTMl 
previews of HTML files.

Copyright (C) 2021  University of Technology Sydney

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
const ROCrate = require("ro-crate").ROCrate;
const tempCrate = new ROCrate();
const asArray = tempCrate.utils.asArray;
const _ = require("lodash");
const { keys } = require("lodash");
const { throws } = require("assert");


class CratePruner {
    constructor(sourceCrate, config) {
        //this.sourceCrate = _.clone(sourceCrate);
        this.sourceCrate = sourceCrate;
        //this.sourceCrate = sourceCrate.clone();
        this.config = JSON.parse(JSON.stringify(config));
   }
    prune(it) {
        const startItem = _.clone(it);
        const targetCrate = new ROCrate();
        targetCrate.index();
        const newItem = _.clone(startItem);
        const root = targetCrate.getRootDataset();
        if (newItem["@id"] === "./") {
            for (let p of Object.keys(newItem))
                root[p] = newItem[p];
        } 
        targetCrate.addItem(newItem); 
        root.about = {"@id": newItem["@id"]};
        for (let type of this.sourceCrate.utils.asArray(startItem["@type"])){
            var subgraph = []
            if (this.config.types[type] && this.config.types[type].resolveAll) {
                for (let resolveThis of this.config.types[type].resolveAll) {
                    let subgraph1 = this.sourceCrate.resolveAll(startItem, resolveThis);
                    subgraph = subgraph1[1];
                    //console.log(subgraph1);
                    for (let i of subgraph) {
                        if (!targetCrate.getItem(i["@id"])) {
                            targetCrate.addItem(JSON.parse(JSON.stringify(i)));
                        }
                    }                     
                }
                
            }
        }
        // Resolve any values that are not on board the new crate
        for (let item of targetCrate.getGraph()) {
            for (let key of Object.keys(item)) {
                const newVals = [];
                for (let val of targetCrate.utils.asArray(item[key])){
                    if (val["@id"]) {
                        if (targetCrate.getItem(val["@id"])) {
                            newVals.push(val);
                        } else {
                              const targetItem = this.sourceCrate.getItem(val["@id"]);
                              if (targetItem) {
                                newVals.push(this.sourceCrate.getItem(val["@id"]).name || val["@id"]);
                              } else {
                                newVals.push(val["@id"]);
                              }
                           
                        }
                    } else {
                        newVals.push(val);
                    }

                }
                if (newVals.length === 1) {
                    item[key] = newVals[0];
                } else {
                    item[key] = newVals;
                }
            }
        }
        targetCrate.addBackLinks();

        return targetCrate;
    }

    isInTypes(item) {
        if (!Array.isArray(item["@type"])) {
            item["@type"] = [ item["@type"]];
        }
        return  Object.keys(this.config.types).filter(value => item["@type"].includes(value)).length > 0
    }

        
}


 module.exports  = CratePruner;