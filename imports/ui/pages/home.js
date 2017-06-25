import '/imports/ui/pages/home.html';
import { ReactiveDict } from 'meteor/reactive-dict';

Template.home.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
});

Template.home.events({
  'click .banner-login': function(event){
    event.preventDefault();
    Session.set('nav-toggle','open');
  },
  'click .banner-dash': function(event){
    event.preventDefault();
    Router.go('/dashboard');
  },
})
