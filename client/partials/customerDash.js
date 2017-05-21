Template.patronDash.helpers({
  rests() {
    // Show newest tasks at the top
    return Rests.find({}, { sort: { createdAt: -1 } });
  },
  first: function(){
       return Meteor.user().profile.firstName;
   },
   last: function(){
       return Meteor.user().profile.lastName;
   }
});