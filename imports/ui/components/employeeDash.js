import '/imports/ui/components/employeeDash.html';

Template.employeeDash.helpers({
  rests() {
		return Meteor.user().profile.worksAt;
  },
  first: function(){
       return Meteor.user().profile.firstName;
   },
   last: function(){
       return Meteor.user().profile.lastName;
   }
});

Template.rest3.events({
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
