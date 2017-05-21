import '/imports/ui/components/ownerDash.html';

Template.addRests.events({
    'submit form': function(event){
        event.preventDefault();
		var restName = event.target.restName.value;
		var restLoc = event.target.restLoc.value;
		var owner = Meteor.user().profile.firstName;
		var ownerId = Meteor.userId();

		Rests.insert({ name: restName, location: restLoc, owner: owner, owner_id:  ownerId});
		event.target.restName.value = '';
		event.target.restLoc.value = '';
    }
});


Template.dashModal.events({
    'click .close-dash': function(event){
		event.preventDefault();
        $(".dash-modal").toggleClass('open');
    }
});

Template.removeRest.events({
    'click .remove-rest': function(event){
		event.preventDefault();
		Meteor.call('rests.remove', Session.get('current-id'));
        $(".dash-modal").toggleClass('open');
    }
});


Template.rest.events({
    'click .accordion': function(event){
		Session.set('current-id',this._id);
    Session.set('current-name',this.name);
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

Template.employees.events({
  'submit form': function(event){
    var email = event.target.empEmail.value;
    var first = event.target.empFirst.value;
    var last = event.target.empLast.value;
    var pos = event.target.empPos.value;
		event.preventDefault();
    Rests.update(Session.get('current-id'), {$push: { employees: {employee_email: email, position: pos, first: first, last: last} }});
    Meteor.call('updateWorksAt', email, Session.get('current-id'),Session.get('current-name') ,pos );
    event.target.empEmail.value = '';
    event.target.empFirst.value = '';
    event.target.empLast.value = '';
    event.target.empPos.value = '';
    }
});


Template.ownerDash.helpers({
  rests() {
    // Show newest tasks at the top
    return Rests.find({owner_id: Meteor.userId()});
  },
  first: function(){
       return Meteor.user().profile.firstName;
   },
   last: function(){
       return Meteor.user().profile.lastName;
   }
});

Template.employees.helpers({
  employees1() {
    // Show newest tasks at the top
	//WorksAt.find({rest: Session.get('current-id')}, { sort: { createdAt: -1 } }).forEach( function(myDoc) { myDoc.position ); } );;
    return Rests.findOne({_id: Session.get('current-id')}, { sort: { createdAt: -1 } }).employees;
  }
});

Template.editRest.helpers({
  name() {
    // Show newest tasks at the top
	//WorksAt.find({rest: Session.get('current-id')}, { sort: { createdAt: -1 } }).forEach( function(myDoc) { myDoc.position ); } );;
    return Rests.findOne({_id: Session.get('current-id')}).name;
  }
  ,
  location(){
	return Rests.findOne({_id: Session.get('current-id')}).location;
  }
});


Template.editRest.events({
    'submit .new-rest-name': function(event){
		event.preventDefault();
        var name = event.target.restName.value;
		Meteor.call('rests.update',Session.get('current-id'),'name',name);
		event.target.restName.value = '';
    },
	'submit .new-rest-loc': function(event){
		event.preventDefault();
        var name = event.target.restLoc.value;
		Meteor.call('rests.update',Session.get('current-id'),'location',name);
		event.target.restLoc.value = '';
    },
});
