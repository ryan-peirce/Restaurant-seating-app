Template.addRests.events({
    'submit form': function(event){
        event.preventDefault();
		var restName = event.target.restName.value;
		var restLoc = event.target.restLoc.value;
		var owner = Meteor.user().profile.firstName;
		var ownerId = Meteor.userId();
		
		Rests.insert({ name: restName, location: restLoc, owner: owner, owner_id:  ownerId});
    }
});


Template.ownerDash.helpers({
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