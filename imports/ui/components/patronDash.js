import '/imports/ui/components/patronDash.html';

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
