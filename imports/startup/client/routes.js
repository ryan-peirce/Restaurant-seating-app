import '/imports/ui/pages/dashboard.js';
import '/imports/ui/pages/home.js';

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
