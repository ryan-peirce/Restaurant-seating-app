import '/imports/startup/accounts-config.js';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import '/imports/startup/client/routes.js';
import '/client/main.html';
import '/imports/ui/components/navigation.js';
import '/imports/ui/components/login.js';

Rests = new Mongo.Collection('rests');
Employees = new Mongo.Collection('employees');
WorksAt = new Mongo.Collection('worksAt');
