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

function render(data) {
return `

<html>
<head>


<script type="application/ld+json"> 
  ${data.json}
</script>
<title>
${data.title}
</title>

<!--
<link rel="stylesheet"
      href="${data.getRootLink("/ro-crate-preview_files/assets/tailwind.css",data.crate)}"/>
<link rel="stylesheet"
      href="${data.getRootLink("/ro-crate-preview_files/assets/site.css",data.crate)}"/>
-->

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

<meta charset='utf-8'/>
<style>

table.table {
  padding-bottom: 300px;
}
</style>
</head>


<body>

<nav class="flex items-center justify-between flex-wrap bg-teal-500 p-6">
 
  <div class="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
    <div class="text-sm lg:flex-grow">

    <a href="${data.getLinkToPath("/",data.crate)}" class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"><span class="glyphicon glyphicon-home dataset_name">&nbsp; Home</a></span></a>
      
    </div>
    <div class="text-sm lg:flex-grow">

    <a href="${data.getLinkToMetadata("/", data.crate)}">⬇️🏷️ Download metadata</a>
      
    </div>

   
  </div>
</nav>




<h1>${data.heading}</h1>

<div class="container">
<div class="jumbotron">
<h1 class="item_name"></h4>
<div id="check"></div>
</div>



<div id="summary">
${data.content}

</div>




</body>
</html>
`}
export default render = render;
