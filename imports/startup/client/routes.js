import '/imports/ui/pages/dashboard.js';
import '/imports/ui/pages/home.js';
import '/imports/ui/pages/app.js';

Router.configure({
    layoutTemplate: 'main'
});

Router.route('/', {
    name: 'home',
    template: 'home'
});

Router.route('/dashboard', {
    name: 'dashboard',
    template: 'dashboard'
});

Router.route('/app', {
    name: 'app',
    template: 'app'
});
