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
class Page {
  constructor(args) {
    this.pageSize = args.pageSize || 20;
    var values = args.values;
    //Values is an array (or singleton) of strings / or objects
    if (!Array.isArray(values)) {
      values = [values];
    }
    this.pages = [];
    this.values = [];

    const l = values.length;
    this.first = values[0];
    [this.last] = values.slice(-1);
    if (l <= this.pageSize) {
      this.values = values;
    }
    else if (l <= this.pageSize * this.pageSize) {
      for (let s = 0; s <= l ; s += this.pageSize)
      {
        this.pages.push(new Page({values: values.slice(s, s + this.pageSize), pageSize: this.pageSize}));
      }
    } else {
      for (let s = 0; s < l ; s += this.pageSize * this.pageSize)
      {
        this.pages.push(new Page({values: values.slice(s, s + this.pageSize * this.pageSize), pageSize: this.pageSize} ))
      }
    }
  }
}

export default Page;

