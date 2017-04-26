# xmlobject

Convert javascript object from and to xml string.

## Install

```sh
$ npm install --save xmlobject
```

## Quickstart

```js
var XML = require('xmlobject');

// Deserialize from xml

var s = '<a b="c" d="e"><f i="j">g<h /></f></a>';

XML.deserialize(s, function(err,r) {
    console.log(r.asJSON())
});

// Serialize to xml

var a = new XML("a");
a.setAttribute("b","c");
a.setAttribute("d","e");
var f = new XML("f");
f.setAttribute("i","j");
f.addChild("g");
f.addChild(new XML("h"))
a.addChild(f);

a.serialize(function(err, r) {
    console.log(r)
});
```

## Copyright and license

MIT © [Aloïs Deniel](http://aloisdeniel.github.io)