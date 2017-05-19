import { Mongo } from 'meteor/mongo';

Rests = new Mongo.Collection('rests');




var postSignUp = function(userId, info){
    console.log(userId, info.profile.role);
    Roles.addUsersToRoles(userId, [info.profile.role]);
}


AccountsTemplates.configure({
    postSignUpHook: postSignUp
});