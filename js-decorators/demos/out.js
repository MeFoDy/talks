'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _desc, _value, _class;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
        desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
        desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
        return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
        Object['define' + 'Property'](target, property, desc);
        desc = null;
    }

    return desc;
}

function fluent(target, name, descriptor) {
    var fn = descriptor.value;
    descriptor.value = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        fn.apply(target, args);
        return target;
    };
}

function decorateWith(decorator) {
    return function (target, name, descriptor) {
        descriptor.value = decorator.call(target, descriptor.value);
    };
}

function describe(description) {
    return function (target, name) {
        target.description = target.description || {};
        target.description[name] = description;
    };
}

var Person = (_dec = describe('Set the name of person'), (_class = function () {
    function Person() {
        _classCallCheck(this, Person);
    }

    _createClass(Person, [{
        key: 'setName',
        value: function setName(first, last) {
            this.first = first;
            this.last = last;
        }
    }, {
        key: 'sayName',
        value: function sayName() {
            console.log(this.first, this.last);
        }
    }]);

    return Person;
}(), (_applyDecoratedDescriptor(_class.prototype, 'setName', [fluent, _dec], Object.getOwnPropertyDescriptor(_class.prototype, 'setName'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'sayName', [fluent], Object.getOwnPropertyDescriptor(_class.prototype, 'sayName'), _class.prototype)), _class));


var p = new Person();
p.setName('Jane', 'Doe').sayName().setName('John', 'Doe').sayName();

var desc = Person.prototype.description.setName;
console.log(desc);
