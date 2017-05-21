import '../imports/startup/accounts-config.js';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';

import './main.html';

Rests = new Mongo.Collection('rests');
Employees = new Mongo.Collection('employees');
WorksAt = new Mongo.Collection('worksAt');

Router.configure({
    layoutTemplate: 'main'
});


Template.home.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
});

Session.set('search','');
Template.patronDash.helpers({
  rests() {
    // Show newest tasks at the top
	if(Session.get('search').localeCompare('')==0){
		return Rests.find({}, { sort: { createdAt: -1 } });
	}
	else{
		return Rests.find({location:Session.get('search')}, { sort: { createdAt: -1 } });
	}
  },
  first: function(){
       return Meteor.user().profile.firstName;
   },
   last: function(){
       return Meteor.user().profile.lastName;
   }
});

Template.patronDash.events({
    'submit form': function(event){
		event.preventDefault();
		
		Session.set('search',event.target.searchArea.value);
  
    },
});

Template.home.events({
    'submit .new-task'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;

        // Insert a task into the collection
        Tasks.insert({
            text,
            createdAt: new Date(), // current time
            owner: Meteor.userId(),
            username: Meteor.user().username,
        });

        // Clear form
        target.text.value = '';
    },
    'change .hide-completed input'(event, instance) {
        instance.state.set('hideCompleted', event.target.checked);
    },
});

Template.LoginModal.events({
    'click .close-login': () => {
        Session.set('nav-toggle','');
    }
});

Template.navigation.events({
    'click .login-toggle': ()=> {
        Session.set('nav-toggle','open');
    },
    'click .logout': ()=> {
    AccountsTemplates.logout();
}
});

Router.route('/', {
    name: 'home',
    template: 'home'
});

Router.route('/dashboard', {
    name: 'dashboard',
    template: 'dashboard'
});


var myLogoutFunc = function(){
    Session.set('nav-toggle','');
    Router.go('/');
}

var mySubmitFunc = function(error, state){
    if (!error) {
        if (state === "signIn") {
            // Successfully logged in
            // ...
            Router.go('/dashboard');
        }
        if (state === "signUp") {
            // Successfully registered
            // ...
            window.alert('Acocunt Successfully Created');
            Router.go('/dashboard');
        }
    }
};

Template['override-atPwdFormBtn'].replaces('atPwdFormBtn');

AccountsTemplates.configure({
    onLogoutHook: myLogoutFunc,
    enablePasswordChange: true,
    showForgotPasswordLink: true,
    privacyUrl: 'privacy',
    termsUrl: 'terms-of-use',
    onSubmitHook: mySubmitFunc,
});


AccountsTemplates.addFields([
    
	{
        _id: 'firstName',
        type: 'text',
        displayName: 'First Name',
        required: true,
    },
    {
        _id: 'lastName',
        type: 'text',
        displayName: 'Last Name',
        required: true,
    },
    {
        _id: "gender",
        type: "select",
        displayName: "Gender",
        required: true,
        select: [
            {
                text: "Male",
                value: "male",
            },
            {
                text: "Female",
                value: "female",
            },
        ],
    }
    ,
    {
        _id: "role",
        type: "select",
        displayName: "What Are You?",
        required: true,
        select: [
            {
                text: "Patron",
                value: "patron",
            },
            {
                text: "Owner",
                value: "owner",
            },
            {
                text: "Employee",
                value: "employee",
            },
        ],
    }
]);

forgetPassword = () => {
    let email = this.refs.email.value;
    Accounts.forgotPassword({email: email}, function (e, r) {
        if (e) {
            console.log(e.reason);
        } else {
            // success
        }
    });
}

Template.dashboard.helpers({
   owner: function(){
       return Roles.userIsInRole(Meteor.userId(), 'owner')
   }
});