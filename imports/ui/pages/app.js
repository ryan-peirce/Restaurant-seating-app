import '/imports/ui/pages/app.html';

Template.app.helpers({
  rest: function() {
		return JSON.stringify(Rests.find({_id: Session.get("current-id")}));
  },
  first: function(){
       return Meteor.user().profile.firstName;
   },
   last: function(){
       return Meteor.user().profile.lastName;
   }
});
