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



const back_links = {
      hasFile: "fileOf",
      hasPart: "isPartOf",
      hasMember: "memberOf",
      memberOf: "hasMember"
    }

const roCrateMetadataID = "ro-crate-metadata.jsonld";

const DATASET_TEMPLATE = {
      "@type": "Dataset",
      "@id": "./",
     };

const METADATA_FILE_DESCRIPTOR = {
      "@type": "CreativeWork",
      "@id": roCrateMetadataID,
      "identifier": roCrateMetadataID,
      "about": {"@id": "./"}
  };

const back_back_links = new Set(Object.values(back_links));

const defaults = {
    ro_crate_name: "ro-crate-metadata",
    roCrateMetadataID: "ro-crate-metadata.jsonld",
    context: ["https://researchobject.github.io/ro-crate/1.0/context.jsonld", {"@vocab": "http://schema.org/"}],
    render_script: '',
    multi_page_render_script: '',
    render_script_fn: (version) => `https://unpkg.com/ro-crate-html@${version}/dist/ro-crate-dynamic.min.js`,
    back_links: back_links,
    back_back_links: back_back_links,
    datasetTemplate: DATASET_TEMPLATE,
    metadataFileDescriptorTemplate: METADATA_FILE_DESCRIPTOR,
    ROCrate_Specification_Identifier: "https://researchobject.github.io/ro-crate/1.0/",
    roCratePreviewFileName: "ro-crate-preview.html",
    pageSize: 50
}


module.exports = defaults;
