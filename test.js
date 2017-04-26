var XML = require('.');
var assert = require('assert');

// Deserialize from xml

var ns = "http://www.example.com/xml/test"
var defaultns = "http://www.example.com/xml/default"
var s = '<a xmlns="'+defaultns+'" xmlns:test="'+ns+'" b="c" d="e"><test:f test:i="j">g<h /></test:f></a>';

XML.deserialize(s, function(err,r) {
    console.log(r.asJSON())
    var f1 = r.firstChild(ns,"f");
    console.log("i: " + f1.getAttribute(ns, "i"));
    console.log("f: " + f1.getText());

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
});