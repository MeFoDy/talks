const COMPONENTS = [];

const bootstrap = function() {
    COMPONENTS.forEach(component => {
        document.querySelectorAll(component.selector).forEach(node => {
            const instance = new component.class();
            node.innerHTML = component.template(instance);
        });
    });
};

function Component(config) {
    config.template = _.template(config.template);
    return function(target) {
        config.class = target;
        COMPONENTS.push(config);
    }
}

@Component({
    selector: 'minsk-js',
    template: `
        <h1>Hello, MinskJS #<%= number %>!</h1>
    `
})
class MinskJsComponent {
    number = 3
}

bootstrap();
