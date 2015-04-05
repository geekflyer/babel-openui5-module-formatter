var R = require('ramda');
var t = require('babel-core/lib/babel/types');
var babelUtil = require('babel-core/lib/babel/util');

module.exports = ModuleFormatter;

function ModuleFormatter() {
    this.imports = {};
}

ModuleFormatter.prototype.transform = function (ast) {

    var body = ast.body;

    // prepend with: var exports = module.exports = {};
    body.unshift(t.variableDeclaration('var', [t.variableDeclarator(t.identifier('exports'), t.assignmentExpression("=", t.identifier('module.exports'), t.objectExpression([])))]));

    // prepend with: var module = {};
    body.unshift(t.variableDeclaration('var', [t.variableDeclarator(t.identifier('module'), t.objectExpression([]))]));

    // return module.exports;
    var returnExportsStatement = t.returnStatement(t.identifier('module.exports'));
    body.push(returnExportsStatement);

    var dependencyArrayExpression = t.arrayExpression(R.values(this.imports).map(t.literal));

    var container = t.functionExpression(null, R.keys(this.imports).map(t.identifier), t.blockStatement(body));

    var defineArgs = [dependencyArrayExpression, container, t.literal(true)];

    var sapUiDefineCall = t.callExpression(t.identifier("sap.ui.define"), defineArgs);

    ast.body = [t.expressionStatement(sapUiDefineCall)];

};

ModuleFormatter.prototype.importDeclaration = function (node, nodes) {
    nodes.push(node);
};

ModuleFormatter.prototype.importSpecifier = function (specifier, node, nodes) {

    this.imports[specifier.local.name] = node.source.value;

//    var ref = t.memberExpression(node, t.getSpecifierId(specifier), false);
//
//nodes.push(t.variableDeclaration("var", [t.variableDeclarator(t.identifier('tasf'), node)]));

};

ModuleFormatter.prototype.exportDeclaration = function (node, nodes) {

    var declar = node.declaration;

    var id = declar.id;

    if (node["default"]) {
        id = t.identifier("default");
    }

    var assign;

    if (t.isVariableDeclaration(declar)) {
        for (var i = 0; i < declar.declarations.length; i++) {
            var decl = declar.declarations[i];

            decl.init = this.buildExportsAssignment(decl.id, decl.init, node).expression;

            var newDeclar = t.variableDeclaration(declar.kind, [decl]);
            if (i === 0) t.inherits(newDeclar, declar);
            nodes.push(newDeclar);
        }
    } else {
        //var ref = declar;

        if (t.isFunctionDeclaration(declar) || t.isClassDeclaration(declar)) {
            //ref = declar.id;
            nodes.push(declar);
        }

        //assign = t.assignmentExpression("=", t.identifier('module.exports'), declar);

        assign = babelUtil.template('exports-default-assign', {VALUE: declar}, true);

        //assign = this.buildExportsAssignment(id, ref, node);

        nodes.push(assign);

        this._hoistExport(declar, assign);
    }

};

ModuleFormatter.prototype._hoistExport = function _hoistExport(declar, assign, priority) {
    if (t.isFunctionDeclaration(declar)) {
        assign._blockHoist = priority || 2;
    }

    return assign;
};

ModuleFormatter.prototype.exportSpecifier = function (specifier, node, nodes) {
    // export { foo };
    nodes.push(babelUtil.template('exports-assign', {KEY: specifier.exported, VALUE: specifier.local}, true));
};