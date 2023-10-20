# Research Object Crate (RO-Crate) HTML preview generation

This nodejs repository has code for generating HTML previews for Research Object Crates ([RO-Crate](https://researchobject.github.io/ro-crate/))

RO-Crates are data packages consisting of a folder/directory of content with a JSON-LD manifest  known as an *RO-Crate Metadata File*, which has the filename `ro-crate-metadata.json` in the root folder. RO-Crates also should have an *RO-Crate Website* which is a local set of web resources, with an index page `ro-crate-preview.html`.

This library consists of tools to create an *RO-Crate Website* for a crate, from the *RO-Crate Metadata File*.

There are two approaches to this:

- `rochtml` is a script that creates an HTML page that summarizes the RO-Crate root dataset (which is always a Schema.org Dataset object expressed in JSONLD) and then dynamically renders details about other entities, both Data Entities (files, datasets and other local and remote streams of data) and Contextual Entities (addition information about data provenance such how files were created, by whom and where) described in the crate. This script creates a single, small HTML file.

In most cases `rochtml` is the most appropriate tool unless the crate you are dealing with is very large (more than 5000 entities) or is largely made up of contextual entities such as historical events, people etc.


## Install

To install this from npm type:

```bash
npm install ro-crate-html
```

To render HTML for an RO-Crate, use `rochtml`:

```bash
rochtml  test_data/sample-ro-crate-metadata.json
```

The script will create an HTML page:

```bash
test_data/sample-ro-crate-preview.html
```

The HTML page has a complete copy of the RO-Crate metadata file's JSON-LD content in a `<script>` element in the `<head>`, and references the compiled rendering script that can then dynamically generate web-views of the RO-Crate metadata: `ro-crate-dynamic.js`. This is available via the Content Distribution Network (CDN) UNPKG which uses the NPM repository: <https://unpkg.com/ro-crate-html-js/dist/ro-crate-dynamic.js>.

### Options



## Develop

To make changes to this code:

-  Download this repository:

```bash
git clone https://github.com/Arkisto-Platform/ro-crate-html-js
cd ro-crate-htmljs
```

-  Install it and link the commandline commands:

```bash
npm install .
npm link --local
```

To compile the rendering script for an RO-Crate HTML file (ro-crate-preview.html):

```bash
npm run build
```

Once this is published in NPM -- set scriptVersion in the defaults to match.


### Docker

Make a container:

`docker buildx build -t rochtml .`

Run the container:

`docker run --rm -v ~/path/to/crate/:/data rochtml /data/ro-crate-metadata.json`


### Testing

run

```bash
npm run test
```
