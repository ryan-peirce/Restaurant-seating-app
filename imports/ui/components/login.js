import '/imports/ui/components/login.html';

Template.LoginModal.events({
    'click .close-login': () => {
        Session.set('nav-toggle','');
    }
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
