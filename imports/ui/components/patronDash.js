import '/imports/ui/components/patronDash.html';

Session.set('search','');
Session.set('party','1');

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
   },
   party: function(){
      return Session.get('party');
   },
   inLine() {
     return Meteor.user().profile.inLine;
   }
});

Template.rest2.helpers({
  inQue() {
    var userId = Meteor.userId();
    for(i in this.que){
      var id = this.que[i].userId;
      if (id === userId)
      return "**IN LINE**";
    }

  },
});

Template.patronDash.events({
    'submit form': function(event){
		event.preventDefault();

		Session.set('search',event.target.searchArea.value);
    Session.set('party',event.target.searchSize.value);

    },
});

Template.rest2.events({
    'click .accordion': function(event){
		Session.set('current-id',this._id);
		event.preventDefault();
    $(".panel").css("maxHeight", "0px");
    $(".accordion").toggleClass('active',false);
    event.target.classList.toggle("active");
    var panel = event.target.nextElementSibling;
    if (panel.style.maxHeight.localeCompare('0px') != 0){
      panel.style.maxHeight = "0px";
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
    },
	'click .get-in-line': function(event){
		event.preventDefault();
		Meteor.call('addToQue',Meteor.userId() ,this._id,Meteor.user().profile.firstName + "," + Meteor.user().profile.lastName,this.name);
  },
  'click .get-out-line': function(event){
		event.preventDefault();
		Meteor.call('leaveQue',Meteor.userId() ,this._id,Meteor.user().profile.firstName + "," + Meteor.user().profile.lastName,this.name);
    }
});
