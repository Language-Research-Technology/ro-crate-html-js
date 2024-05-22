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

if (typeof window === 'undefined') {
    global.window = { location: { href: '' } };
}
const defaults = require("./defaults");
//const _ = require("lodash");
const Page = require("./paginate");
//const { times } = require("lodash");

const display_keys = [
    "@id",
    "name",
    "familyName",
    "givenName",
    "@type",
    "description",
    "funder",
    "memberOf",
    "isPartOf",
    "fileOf",
    "thumbnail",
    "datePublished",
    "author",
    "encodingFormat",
    "contentSize",
    "affiliation",
    "email"
];

const displayTypeTemplates = {
    "PropertyValue": (item) => { return `${item.name}: ${item.value}` },
    "GeoCoordinates": (item) => { return `Lat: ${item.latitude}, Long: ${item.longitude}` }
}

class Preview {
    constructor(crate, config, id) {
        this.defaults = defaults;
        this.crate = crate;
        this.config = config || {}; //TODO - add some defaults here;
        this.crate.index();
        this.crate.addBackLinks();
        this.rootId = this.crate.getRootId();
        this.baseID = id || this.rootId;
        this.root = this.crate.getRootDataset();
        if (!this.crate.context) {
            this.crate.resolveContext();
        }
        this.places = [];
    }


    async display(id) {
        const datasetDisplay = await this.renderMetadataForItem(id);
        document.getElementById("summary").innerHTML = datasetDisplay;
    }

    completeDataset(entryID, dontShowRootDataset) {
        entryID = entryID || this.crate.getRootId();
        var html = "";
        html += this.metaTable(this.crate.getItem(entryID));
        this.baseID = entryID;
        for (let item of this.crate.getJson()["@graph"]) {
            if (item["@id"] != entryID &&
                !this.displayTypeAsString(item) &&
                !this.crate.defaults.roCrateMetadataIDs.includes(item["@id"]) && !(dontShowRootDataset && item["@id"] === this.crate.getRootID())) {
                html += this.metaTable(item, true);
            }
        }
        return html;
    }
    // only display direct children of the root dataset
    async summarizeDataset() {
        // Makes HTML tables for RO-Crate Core Metadata - just a teaser of the contents, not all of it  
        var keepIds = [this.rootId];
        for (let prop of this.sortKeys(Object.keys(this.root))) {
            var values = this.crate.utils.asArray(this.root[prop]);
            for (let v of values) {
                if (v["@id"] && !keepIds.includes(v["@id"])) {
                    keepIds.push(v["@id"]);
                }
            }
        }
        // Now prune out stuff we don't need into a new graph
        var newGraph = []
        for (let i of this.crate.getJson()["@graph"]) {
            if (keepIds.includes(i['@id'])) {
                newGraph.push(i);
            }
        }

        //this.crate.getJson()["@graph"] = newGraph;
        //this.crate.init(this.crate.getJson());
        // And generate HTML for what's left
        const dontShowPreviews = (this.root.hasPart && this.root.hasPart.length > defaults.pageSize);
        var allMeta = `<div class='all-meta'>`;
        for (let i of keepIds) {
            allMeta += await this.renderMetadataForItem(i, dontShowPreviews);
            allMeta += "<hr/><br/><br/>";
        }
        allMeta += `</div>`;
        // Don't try to show files if there are a lot - ie more than one

        return allMeta;
    }



    async renderMetadataForItem(id, dontShowPreviews) {
        //var item = _.clone(this.crate.getItem(id));
        var item = this.crate.getItem(id);
        if (!item) {
            return "";
        }
        // Check if there are any parts that should be displayed up top



        // Thumbnail if present

        // Display a table or table-like - core metadata show all the properties


        var itemHtml = `
           <div>
            ${this.header(item)}
            ${this.image(item)}
            ${this.previews(item, dontShowPreviews)}
            ${this.articleBody(item)}
            ${this.metaTable(item)}

        </div>
        `;
        return itemHtml;

    }

    displayPlaces() {
        const config = this.config;
        // Places is an GeoJSON object
        if (config && this.places && this.places.type === "FeatureCollection") {

            var jsonString = JSON.stringify(places, null, 2)

            const dir = config.geoURL;
            return `
            <link rel='stylesheet' href='${dir}/css/leaflet.css'/>
            <script src='${dir}/js/jquery-3.5.1.min.js'></script>
            <script src='${dir}/js/leaflet.js'></script>
            <script src='${dir}/js/timeSliderControl.js'></script>
            <link rel='stylesheet' href='${dir}/css/jquery-ui.css'/>
            <script src='${dir}/js/jquery-ui.js'></script>
            <link rel='stylesheet' href='${dir}/css/style.css'/>
    
            <link rel='stylesheet' href='${dir}/css/MarkerCluster.css'/>
            <link rel='stylesheet' href='${dir}/css/MarkerCluster.Default.css'/>
            <script src='${dir}/js/leaflet.markercluster.js'></script>
    
            <div id='mapdiv' style='height: 420px;'></div>
            <script src='${dir}/js/mapmaker.js'></script><!-- Handles a lot of the marker stuff -->
    
            <script>mapinit(${JSON.stringify(this.places)})</script>
            
            <a href="data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.places))}" download="geojson.json">Download GeoJSON</a>

    
            `
        } else {
            return ``;
        }
    }

    header(item) {
        // Display the name of the thing with apropriate download links etc
        var name = item.name ? item.name : item["@id"];
        var types = this.crate.utils.asArray(item["@type"]);
        var view;
        var path = item["@id"];
        var idLink = "";
        // Special treatment for Datasets - add download links if there is a distribution
        if (path.match(/^https?:\/\//i)) {
            view = "Go to: ";
        } else if (types.includes("Dataset")) {
            if (window.location.href.match(/^file:\/\//i)) {
                view = "Browse files ";
            }
            if (item["distribution"]) {
                for (let dist of this.crate.utils.asArray(item["distribution"])) {
                    const download = this.crate.getItem(dist["@id"]);
                    // Dealing with legacy - we used to have path mapped to contentUrl
                    if (download) {
                        var downloadName = download.name ? download.name : name;
                        var u = download["contentUrl"] ? download["contentUrl"] : download["path"];
                        if (u) {
                            idLink += `<a href="${u}">⬇️📦 Download this dataset: ${downloadName}</a><br/>`;

                        }
                    }
                }
            }
        } else if (types.includes("File") || types.includes("ImageObject") || types.includes("MediaObject") || path === "ro-crate-metadata.jsonld") {
            view = "⬇️ Download: ";
        }
        if (view) {
            idLink += `<a href="${path}">${view}</a>`;
        }
        return `<h3>${idLink} ${name}</h3>`
    }

    image(item) {
        var image = "";
        if (item.image || item.thumbnail) {
            var src;
            if (item.image && item.image.length > 0) {
                src = this.crate.utils.asArray(item.image)[0];
                delete item.image;
            } else if (item.thumbnail && item.thumbnail.length > 0) {
                src = this.crate.utils.asArray(item.thumbnail)[0];
                delete item.thumbnail;
            }
            if (src) {
                if (src["@id"]) {
                    src = src["@id"];
                }
                image = `<img src="${src}" width="80%">`;
            }
        }
        return image;
    }
    articleBody(item) {
        // See if there are any fragments to display - if there are references to things which have
        // articleBody but no name (for lab notebook display)
        var articleBody = ""
        for (let part of this.crate.utils.asArray(item.hasPart)) {
            const p = this.crate.getItem(part["@id"]);
            if (p && this.crate.utils.asArray(p["@type"]).includes("Article") && p.articleBody) {
                for (let b of this.crate.utils.asArray(p.articleBody)) {
                    articleBody += `<div><hr><div style="font: small; text-align: right" >${p.description}</div>${b}</div>`
                }
            }
        }
        return articleBody;
    }

    script() {
        const url = this.config.renderScript || this.crate.defaults.render_script;
        return `<script src="${url}"></script>`
    }
    previews(item, dontShowPreviews) {
        var p = `${item["@id"]}`;
        if (this.config.utils) {
            p = this.config.utils.getImagePath(this.baseID, p)
        }
        var previews = "";
        var types = this.crate.utils.asArray(item["@type"]);
        if (!dontShowPreviews && (types.includes("Dataset") || types.includes("File") || types.includes("ImageObject") || types.includes("MediaObject"))) {
            if (p.match(/(\.txt$)|(\.html?$)/i)) {
                previews += `<iframe src='${p}' width='100%' height='500'></iframe>`;
            } else if (p.match(/(\.mp3)|(\.ogg?)|(\.wav)$/i)) {
                previews += `<audio controls><source src='${p}'/></audio>`;
            } else if (p.match(/(\.jpe?g)|(\.png)$/i)) {
                previews += `<img width='100%' style='object-fit: contain' src='${p}'/>`;
            }
            else if (p.match(/pdf$/i)) {
                previews += `<embed  src="${p}" type="application/pdf" width="100%" height="600px" />`;

            }
        }
        return previews;
    }

    metaTable(it, showName) {
        // Generate a "table" (or other structure)
        //const item = _.clone(it);
        const item = it;
        var name = "";
        if (showName) {
            name = `<h4>${this.crate.utils.asArray(item.name).join(" ")}</h4>`;
            delete item.name;
        }
        var rows = "";
        for (let prop of this.sortKeys(Object.keys(item))) {
            if (prop === "@reverse") {
                // Do nothing
            } else {
                rows += this.metadataRow(item, prop);
            }
        }
        if (item["@reverse"]) {
            rows += `<tr><th colspan="2" style="text-align:center">Items that reference this one</th><tr>`;
            for (let prop of Object.keys(item["@reverse"])) {
                rows += this.metadataRow(item["@reverse"], prop);

            }
        }
        return `
        <div id="${item["@id"]}">
            ${name}
            <table class="table metadata table-striped" >
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    }

    sortKeys(keys) {
        // Sort a set or array of keys to be in a nice order
        // Returns set
        var keys_in_order = new Set();
        keys = new Set(keys);
        for (let key of display_keys) {
            if (keys.has(key)) {
                keys_in_order.add(key);
            }
        }
        for (let key of keys) {
            if (!keys_in_order.has(key)) {
                keys_in_order.add(key);
            }
        }
        return keys_in_order;
    }


    metadataRow(item, prop) {
        if (this.crate.context) {
            const def = this.crate.getDefinition(prop) || {};
            var propName = prop;
            if (def["rdfs:comment"]) {
                propName = def["rdfs:label"] || propName;
                propName = `${propName}<span>&nbsp;</span><span name="propName" title="${def["rdfs:comment"]}">[?]</span>`

            } else if (def["@id"]) {
                propName = `${propName}<span>&nbsp;</span><a href="${def["@id"]}">[?]</a>`;
            }
        }
        return `<tr>
            <th style="text-align:left;" class="prop">${propName}</th>
            <td style='text-align:left'>${this.displayValues(item[prop])}</td>
            </tr>`;
    }

    displayValuesAsString(v) {
        const vals = this.crate.utils.asArray(v);
        var html = "";
        for (v of vals) {
            html += this.displayValue(v);
        }
        return html;
    }

    displayValues(v) {
        const vals = this.crate.utils.asArray(v);
        const page = new Page({ values: vals, pageSize: this.defaults.pageSize });
        return this.displayPage(page);
    }


    displayPage(page) {
        var html = "";
        if (page.pages.length > 0) {
            for (let p of page.pages) {
                if (p.first && p.last) {
                    html += `
                        <details style='margin-left: 3%'>
                            <summary>
                                ${this.displayValue(p.first)} -to- ${this.displayValue(p.last)}
                            </summary>
                            ${this.displayPage(p)}
                        </details>
                `;
                }
            }
        } else {
            if (page.values.length > 1) {
                html += "<ul>";
                for (let p of page.values) {
                    html += `
                        <li>${this.displayValue(p)}</li>
                        `;
                }
                html += "</ul>";
            } else if (page.values[0]) {
                html += `${this.displayValue(page.values[0])}`;
            }
        }
        return html;
    }


    displayTypeAsString(item) {
        // Return either false or a function to render this particular type of item
        const types = this.crate.utils.asArray(item["@type"]);
        for (let type of types) {
            const renderFunction = displayTypeTemplates[type];
            if (renderFunction) {
                return renderFunction;
            }
        }
        return null;
    }


    displayValue(val) {
        if (val["@id"]) {
            var target = this.crate.getItem(val["@id"]);
            if (target) {
                var name = target.name || target.value || target["@id"];
                if (this.config.utils && this.config.utils.hasOwnPage(target, this.config)) {
                    return `<a href="${this.config.utils.getLink(this.baseID, target["@id"])}">${name}</a>`;
                }
                const renderFunction = this.displayTypeAsString(target);
                if (!renderFunction) {
                    return `<a href="#${escape(target["@id"])}">${name}</a>`
                } else {
                    return renderFunction(target);
                }
            } else {
                if (val["@id"].toString().match(/^https?:\/\//i)) {
                    return `<a href="${val["@id"]}">${val["@id"]}</a>`
                }
                else {
                    return val["@id"];
                }
            }
        }

        else if (val.toString().match(/^https?:\/\//i)) {
            return `<a href="${val}">${val}</a>`;
        } else {
            return `<span>${val}</span>`;
        }
    }
}

module.exports = Preview;
