import '/imports/ui/components/navigation.html';

Template.navigation.events({
    'click .login-toggle': ()=> {
        Session.set('nav-toggle','open');
    },
    'click .logout': ()=> {
    AccountsTemplates.logout();
}
});
