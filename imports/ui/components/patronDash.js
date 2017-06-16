import '/imports/ui/components/patronDash.html';

Session.set('search','');
Session.set('party','4');


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
   },
   contactSMS: function(){
     return Meteor.user().profile.contactSMS;
   },
   contactEmail: function(){
     return Meteor.user().profile.contactEmail;
   }
});

Template.rest2.helpers({
  inQue() {
    var userId = Meteor.userId();
    var found = false;
    var obj = {
      name:"",
      status:"",
      overall:""
    }
    for(i in this.que){
      var id = this.que[i].userId;
      var party = this.que[i].party;
      var wait = this.que[i].wait;
      if (id === userId){
        obj.name =  i +" groups in front of you. Remaining wait: "+wait+" mins";
        obj.status = "**IN LINE**";
        found = true;

      }

    }
    if(found == false){
      var wait = 0;
      switch(Session.get('party')){
        case '1':
          wait = this.waits.one;
          break;
        case '2':
          wait = this.waits.two;
          break;
        case '3':
          wait = this.waits.three;
          break;
        case '4':
          wait = this.waits.four;
          break;
        case '5':
          wait = this.waits.five;
          break;
        case '6+':
          wait = this.waits.sixUp;
          break;
      }
      obj.overall = 'Current wait time: ' + wait + ' mins';
    }
    return obj;
  },
});

Template.patronDash.events({
    'submit form': function(event){
		event.preventDefault();

		Session.set('search',event.target.searchArea.value);
    Session.set('party',event.target.searchSize.value);

  },
	/*'click .send': function(){
		Meteor.call('sendEmail', Meteor.user().emails[0].address);
	},
  'click .textMsg': function(){
    Meteor.call('sendSMS', Meteor.user().profile.phone);
  },*/
  'change .sms': function(event) {
    //interval = Meteor.setInterval(function() {Meteor.call('sendSMS', Meteor.user().profile.phone);},10000);
    Meteor.users.update(Meteor.userId(), {$set: {'profile.contactSMS': event.target.checked}});
	},
  'change .email': function(event) {
	   Meteor.users.update(Meteor.userId(), {$set: {'profile.contactEmail': event.target.checked}});
	}
});

Template.rest2.events({
    'click .accordion': function(event){
		Session.set('current-id',this._id);
    event.preventDefault();
    $(".panel").css("maxHeight", "0px");
    var act = event.target.classList.contains('active');
    $(".accordion").toggleClass('active',false);
    var panel = event.target.nextElementSibling;
    if(act){
      event.target.classList.toggle("active",false);
      panel.style.maxHeight = "0px";
    }
    else{
      event.target.classList.toggle("active",true);
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
    },
	'click .get-in-line': function(event){
		event.preventDefault();
		Meteor.call('addToQue',Meteor.userId() ,this._id,Meteor.user().profile.firstName + "," + Meteor.user().profile.lastName,this.name, Session.get('party'), Meteor.user().profile.phone, Meteor.user().emails[0].address, Meteor.user().profile.contactSMS, Meteor.user().profile.contactEmail);
    Meteor.call('rests.updateWaits');
  },
  'click .get-out-line': function(event){
		event.preventDefault();
		Meteor.call('leaveQue',Meteor.userId() ,this._id,Meteor.user().profile.firstName + "," + Meteor.user().profile.lastName,this.name);
    Meteor.call('rests.updateWaits');
    }
});
