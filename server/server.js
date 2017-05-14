var postSignUp = function(userId, info){
    console.log(userId, info.profile.role);
    Roles.addUsersToRoles(userId, [info.profile.role]);
}




AccountsTemplates.configure({
    postSignUpHook: postSignUp
});