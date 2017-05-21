import '/imports/ui/pages/home.html';
import { ReactiveDict } from 'meteor/reactive-dict';

Template.home.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
});
