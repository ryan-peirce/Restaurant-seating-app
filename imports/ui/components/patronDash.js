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
	'click .rest-option': function(event){
		event.preventDefault();
		$(".dashModalOptions").toggleClass('hidden',true);
		$("#"+event.target.name+"").toggleClass('hidden');
        $(".dash-modal").toggleClass('open');
    }
});
