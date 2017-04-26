var sax = require("sax");

function serializeNode(scope, node) {
    scope = scope || 0;
    var result = prefix(scope) + '<' + node.name;

    // Attributes
    for(var name in node.attributes) {
        result += ' ' + name + '="' + node.attributes[name] + '"';
    }

    // Children
    if(node.children.length > 0) {
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

  constructor(name, parent) {
    if(!name) throw new Error("node should have at least a name");
    this.name = name;
    this.parent = parent;
    this.attributes = {};
    this.namespaces = [];
    this.children = [];
  }

  // #region Attributes

  getAttribute(ns, name) {
    if(name)
    {
        var prefix = this.getNamespacePrefix(ns);
        name = prefix + ":" + name;
    }
    else name = ns;
	return this.attributes[name];
  }

  setAttribute(ns, name, value) {
    if(value)
    {
        var prefix = this.getNamespacePrefix(ns);
        name = prefix + ":" + name;
    }
    else
    {
        value = name;
        name = ns;
    }

    if(name.startsWith("xmlns:"))
    {
        var res = name.split(":");
        this.addNamespace(res[1], value);
    }
    else if(name === "xmlns")
    {
        this.addNamespace("", value);
    }

	this.attributes[name] = value;
  }

  // #region Text

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

  // #region Namespaces

  namespace() {
      var res = this.name.split(":");
      if(res.length == 2)return this.getNamespaceValue(res[0]);
      else return this.getNamespaceValue("");
  }

  addNamespace(prefix, url) {
    this.namespaces.push({ prefix: prefix, value: url });
	this.attributes["xmlns:"+prefix] = url;
  }

  nameWithoutPrefix() {
      var res = this.name.split(":");
      if(res.length == 2) return res[1];
      else return this.name;
  }

  getNamespacePrefix(value) {
      var ns = this.namespaces.find(function(n) { return n.value === value;});
      if(ns) return ns.prefix;
      if(this.parent) return this.parent.getNamespacePrefix(value);
      return null;
  }

  getNamespaceValue(prefix) {
      var ns = this.namespaces.find(function(n) { return n.prefix === prefix;});
      if(ns) return ns.value;
      if(this.parent) return this.parent.getNamespaceValue(prefix);
      return null;
  }

  // #region Children 

  createChild(ns,name) {
    if(name != null)
    {
        var prefix = this.getNamespacePrefix(ns);
        name = prefix + ":" + name;
    }
    else name = ns;

    var child = new Node(name, this);
    this.addChild(child);
    return child;
  }

  addChild(c) {
      this.children.push(c);
  }

  findChildren(ns, name) {
    if(name )return this.children.filter(function(c) { return  name == c.nameWithoutPrefix() && c.namespace() === ns;});
    return this.children.filter(function(c) { return ns == c.name }); 
  }

  firstChild(ns,name) {
    if(name)return this.children.find(function(c) { return  name == c.nameWithoutPrefix() && c.namespace() === ns;});
    return this.children.find(function(c) { return ns == c.name }); 
  }

  // #region Serialization

  static deserialize(s,cb) {
        var stack = [];
        var current = null;

        var parser = sax.parser(true);
        parser.onopentagstart = function (node) {
            if(stack.length > 0) {
                var parent = stack[stack.length - 1];
                current = parent.createChild(node.name);
            }
            else {
                current = new Node(node.name);
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

    asObject() {
        return {
            name: this.name,
            attributes: this.attributes,
            namespaces: this.namespaces,
            children: this.children.map(function(c) { 
                if (typeof c === 'string') return c;
                return c.asObject(); 
            })
        }
    }

    asJSON() { return JSON.stringify(this.asObject()); }
}

module.exports = Node;