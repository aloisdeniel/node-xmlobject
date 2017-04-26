var sax = require("sax");

function serializeNode(scope, node) {
    scope = scope || 0;
    var result = prefix(scope) + '<' + node.name;

    // Attributes
    for(var name in node.attributes) {
        result += ' ' + name + '="' + node.attributes[name] + '"';
    }

    // Children
    if(node.children) {
        result += '>\n';
        node.children.forEach(function(c) {
            if (typeof c === 'string') result += c;
            else result += serializeNode(scope + 1,c) + "\n";
        }, this);
        result += prefix(scope) + '</'+node.name+'>';
    }
    else{
        result += ' />';
    }
    return result;
}

function prefix(scope) { return Array(scope+1).join(" "); }

class Node {

  constructor(name) {
    if(!name) throw new Error("node should have at least a name");
    this.name = name;
    this.attributes = {};
    this.children = [];
  }

  getAttribute(name) {
	return this.attributes[name];
  }

  setAttribute(name, value) {
	this.attributes[name] = value;
  }

  getTextNodes() {
      return this.children.filter(function(c) { return typeof(c) === 'string'; });
  }

  getText() {
      var textNodes = this.getTextNodes();
      return textNodes.join("");
  }

  setText(value) {
      // Deleting old text first
      var textNodes = this.getTextNodes();
      textNodes.forEach(function(t) {
        this.children.splice(this.children.indexOf(t), 1);
      }, this);

      this.addChild(value);
  }

  addChild(c) {
      this.children.push(c);
  }

  findChildren(name) {
      return this.children.filter(function(c) { return c.name === name;});
  }

  firstChild(name) {
      return this.children.find(function(c) { return c.name === name;});
  }

  static deserialize(s,cb) {
        var stack = [];
        var current = null;

        var parser = sax.parser(true);
        parser.onopentagstart = function (node) {
            current = new Node(node.name);
            if(stack.length > 0)
            {
                stack[stack.length - 1].addChild(current);
            }
            stack.push(current);
        };
        parser.onattribute = function (node) { current.setAttribute(node.name, node.value); };
        parser.ontext = function (t) { stack[stack.length - 1].addChild(t); };
        parser.onclosetag = function (node) { current = stack.pop(); };
        parser.onend = function (node) { cb(null,current) };
        parser.onerror = cb;

        parser.write(s).close();   
  }

  serialize(cb) {
        try {
            var result = serializeNode(0, this);
            cb(null,result);
        } catch (error) {
            cb(error);
        }
    }

    asJSON() {
        return JSON.stringify(this);
    }
}

module.exports = Node;