import { Mongo } from 'meteor/mongo';

Rests = new Mongo.Collection('rests');
Employees = new Mongo.Collection('employees');
WorksAt = new Mongo.Collection('worksAt');



var postSignUp = function(userId, info){
    console.log(userId, info.profile.role);
    Roles.addUsersToRoles(userId, [info.profile.role]);
}


AccountsTemplates.configure({
    postSignUpHook: postSignUp
});