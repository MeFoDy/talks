function fluent(target, name, descriptor) {
    const fn = descriptor.value;
    descriptor.value = function(...args) {
        fn.apply(target, args);
        return target;
    }
}

function decorateWith(decorator) {
    return (target, name, descriptor) => {
        descriptor.value = decorator.call(target, descriptor.value);
    }
}

function describe(description) {
    return (target, name) => {
        target.description = target.description || {};
        target.description[name] = description;
    };
}

class Person {
    @fluent
    @describe('Set the name of person')
    setName(first, last) {
        this.first = first;
        this.last = last;
    }

    @fluent
    sayName() {
        console.log(this.first, this.last);
    }
}

const p = new Person();
p.setName('Jane', 'Doe').sayName().setName('John', 'Doe').sayName();

const desc = Person.prototype.description.setName;
console.log(desc);
