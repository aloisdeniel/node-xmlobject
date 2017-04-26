var XML = require('.');
var assert = require('assert');

var s = '<a xmlns:test="http://www.example.com/xml/test" b="c" d="e"><test:f test:i="j">g<h /></test:f></a>';

var a = new XML("a");
a.setAttribute("xmlns:test","http://www.example.com/xml/test");
a.setAttribute("b","c");
a.setAttribute("d","e");
var f = new XML("test:f");
f.setAttribute("test:i","j");
f.addChild("g");
f.addChild(new XML("h"))
a.addChild(f);


XML.deserialize(s, function(err,r) {
    console.log(err)
    console.log(r.asJSON())

    var f1 = r.firstChild("test:f");
    console.log("i: " + f1.getAttribute("test:i"));
    console.log("f: " + f1.getText());

});

a.serialize(function(err, r) {
    console.log(err);
    console.log(r);
});