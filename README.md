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

var ns = "http://www.example.com/xml/test"
var defaultns = "http://www.example.com/xml/default"
var s = '<a xmlns="'+defaultns+'" xmlns:test="'+ns+'" b="c" d="e"><test:f test:i="j">g<h /></test:f></a>';

XML.deserialize(s, function(err,r) {
    console.log(r.asJSON())
    var f1 = r.firstChild(ns,"f");
    console.log("i: " + f1.getAttribute(ns, "i"));
    console.log("f: " + f1.getText());

    /* ->
    {"name":"a","attributes":{"xmlns:":"http://www.example.com/xml/default","xmlns":"http://www.example.com/xml/default","xmlns:test":"http://www.example.com/xml/test","b":"c","d":"e"},"namespaces":[{"prefix":"","value":"http://www.example.com/xml/default"},{"prefix":"test","value":"http://www.example.com/xml/test"}],"children":[{"name":"test:f","attributes":{"test:i":"j"},"namespaces":[],"children":["g",{"name":"h","attributes":{},"namespaces":[],"children":[]}]}]}
    */

});

// Serialize to xml

var a = new XML("a");
a.setAttribute("b","c");
a.setAttribute("d","e");
a.addNamespace("test", ns)

var f = a.createChild(ns,"f");
f.setAttribute(ns,"i","j")
f.addChild("g");
f.createChild("h");

a.serialize(function(err, r) {
    console.log(r);

     /* ->
    <a b="c" d="e" xmlns:test="http://www.example.com/xml/test">
        <test:f test:i="j">
        g  <h />
        </test:f>
    </a>
    */
});
```

## Warning

*xmlobject* is a perfect fit for small parsing scenario where all data could remain in memory but would not be perfectly optimized for parsing mega-octets of xml content where a stream/sax based approach would be better.

## Copyright and license

MIT © [Aloïs Deniel](http://aloisdeniel.github.io)