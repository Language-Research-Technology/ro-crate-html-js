/* This is part of the RO-Crate tolls for implementing the RoCrate data packaging
spec.  Copyright (C) 2020  University of Technology Sydney

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
const Pruner = require('../lib/prune-crate');
const chai = require('chai');
chai.use(require('chai-fs'));
const ROCrate = require("ro-crate").ROCrate;
const fs = require("fs");


describe('Pruning', function () {
    it('Does basic pruning', function () {
        const crate = new ROCrate();
        crate.index();
        const root = crate.getRootDataset();
        const loc1 = {"@id": "#Location1", "name": "Location 1", "@type": "geo"};
        const place1 = {"@id": "#Place1", "name": "Place 1", "@type": "Place", "location": {"@id": loc1["@id"]}};
        const item1 = {"@id": "#Person1", "name": "Person 1", "@type": "Person", "birthPlace": {"@id": place1["@id"]}};
        const doc1 = {"@id": "#doc1", "name": "Doc 1", "@type": "CreativeWork", "about": {"@id": item1["@id"]}}


        crate.addItem(loc1);
        crate.addItem(item1);
        crate.addItem(place1);
        crate.addItem(doc1);
        crate.addBackLinks();

        root.about = [item1["@id"]];

        const config1 = {
            "types": 
               {"Person" : {
                 "resolveAll" :  [[{"property": "birthPlace"}]]
               }
            }
        }   
        const Pruner1 = new Pruner(crate, config1);
        const pruned1 = Pruner1.prune(item1);
        assert.equal(pruned1.getItem("#Place1").name, "Place 1");
        assert.equal(pruned1.getGraph().length, 4);
        config1.types.Person.resolveAll.push([{"property": "birthPlace"}, {"property": "location"} ]);
        const Pruner2 = new Pruner(crate, config1);
        const pruned2 = Pruner2.prune(item1);
        assert.equal(pruned2.getItem("#Location1").name, "Location 1");
        assert.equal(pruned2.getGraph().length, 5);

        config1.types.Person.resolveAll= [[{"property": "about", "@reverse": true}]];

        const Pruner3 = new Pruner(crate, config1);
        const pruned3 = Pruner3.prune(item1);
        assert.equal(pruned3.getItem("#doc1").name, "Doc 1");
        assert.equal(pruned3.getGraph().length, 4);
    });

    it('Works on a big real crate', function () {
        const json = JSON.parse(fs.readFileSync("test_data/convictions-metadata.json", 'utf8'));
        const crate = new ROCrate(json);
        crate.index();
        crate.addBackLinks();

        const root = crate.getRootDataset();
        

        
        const config1 = {
                "types":  {"Person" : {
                                "resolveAll": [
                                    [{"property": "birthPlace"}],
                                    [{"property": "object", "@reverse": true}, {"property": "location"}, {"property": "geo"}]
                                ]
                                
                    }
                }
            }
        const item1 = crate.getItem("#person__VICFP_18551934_6_249");
        const Pruner1 = new Pruner(crate, config1)
        const pruned1 = Pruner1.prune(item1);
        assert.equal(pruned1.getItem("#person__VICFP_18551934_6_249").name, "ANDERSON, FANNY");
        assert.equal(pruned1.getGraph().length, 6);
        
        
        const config3 = {
            "types": {
           
                "Offence" : {
                    "findPlaces": "offence-geo.js",
                    resolveAll: [
                        [{"property": "offence", "@reverse": true},{"property": "object"}]

                    ]
                        
                    }
               
                }
            }
        

        const Pruner3 = new Pruner(crate, config3)
        offence = crate.getItem("#offence_ILLEGALLY_SELLING_LIQUOR");
        const pruned3 = Pruner3.prune(offence, config3);
        //console.log("PRUNED", JSON.stringify(pruned3.getGraph(), null, 1));
        assert.strictEqual(pruned3.getItem("#person__VICFP_18551934_8_151").name, "CROKER, BELINDA")




        
    });
    
});

