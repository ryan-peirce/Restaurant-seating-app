import '/imports/ui/pages/app.html';


Template.app.rendered = function(){
  if(Meteor.user() === null){
    alert('permission denied');
    Router.go('/');
  }
  else{
    var found = false;
    var id = Iron.Location.get().path.split('?');
    Session.set('current-id', id[1]);
    var works = Meteor.user().profile.worksAt;
    for(i in works){
      if(works[i].restId === id[1]){
        found = true;
        alert('permission granted');
      }
    }
    if(found === false){
      alert('permission denied');
      Router.go('/');
    }
  }





}
/*
setInterval(function(){
  console.log('f');
  Meteor.call('rests.tables.updateTime', Session.get('current-id'));
}, 2000);
*/
Template.tables.events({
  'click .accordion': function(event){
  Session.set('table-name',this.name);
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
  'click .toggle-status': function(event){
    var status;
    var restWait = Rests.findOne({_id: Session.get('current-id')}).avg_wait;
    var avgWait;
    switch(this.seats) {
      case "1":
        avgWait = restWait.one;
        break;
      case "2":
        avgWait = restWait.two;
        break;
      case "3":
        avgWait = restWait.three;
        break;
      case "4":
        avgWait = restWait.four;
        break;
      case "5":
        avgWait = restWait.five;
        break;
      default:
        avgWait = restWait.sixUp;
      }

    if(this.status === 'open'){
      status = 'full';
    }
    else{
      status = 'open';
    }
    Meteor.call('rests.tables.toggleStatus', Session.get('current-id'), this.name, status, avgWait);
    Meteor.call('rests.updateWaits');
  },
  'click .add-wait': function(event){
    $(".small-modal").toggleClass('open');
  }
})

Template.line.events({
  'click .accordion': function(event){
  Session.set('patron-name',this.name);
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
  'click .seat-remove': function(event){
    Meteor.call('leaveQue',this.userId , Session.get('current-id'));
    Meteor.call('rests.updateWaits');
    var phoneNumber = this.phone;
    var emailAddress = this.email;
    var message = "Your reservation is ready.";
      console.log(phoneNumber,message);
      if (this.contactSMS){
        Meteor.call('sendSMS', phoneNumber, message);
      }
      if (this.contactEmail){
        Meteor.call('sendEmail', emailAddress, message);
      }
  }
})

Template.appModal.events({
    'click .close-dash': function(event){
		    event.preventDefault();
        $(".dash-modal").toggleClass('open');
    },
    'submit .add-to-list': function(event){
      event.preventDefault();

      Meteor.call('addToQue', event.target.phone.value, Session.get('current-id'), event.target.name.value, restName,event.target.party.value, event.target.phone.value);
      Meteor.call('rests.updateWaits');

    }
});

Template.waitModal.events({
  'click .close-dash': function(event){
      $(".small-modal").toggleClass('open');
  },
  'submit .addTime': function(event){
    event.preventDefault();
    Meteor.call('rests.tables.addTime', Session.get('current-id'), Session.get('table-name'), event.target.time.value);
    Meteor.call('rests.updateWaits');
    //Meteor.call('addToQue', event.target.phone.value, Session.get('current-id'), event.target.name.value, restName,event.target.party.value, event.target.phone.value);
  }
});

Template.app.events({
  'click .add-to-que': function(event){
    $(".dash-modal").toggleClass('open');
  }
})

var restName = function(){
  var id = Iron.Location.get().path.split('?');
  return Rests.find({_id: id[1]}).name;
}

Template.app.helpers({
  rest: function() {
    var id = Iron.Location.get().path.split('?');
		return Rests.find({_id: id[1]});
  },
  first: function(){
       return Meteor.user().profile.firstName;
   },
   last: function(){
       return Meteor.user().profile.lastName;
   }
});



Template.tables.helpers({
  tables: function(){
    return Rests.findOne({_id: Session.get('current-id')}).tables;
  }
});

Template.table1.helpers({
  color: function(){
    var color = 'df';

    return color;
  },
  createdAtFormatted: function(context, options) {

    var d = new Date();
		var n = d.getTime();
    if(context)
    return Template.instance().createdAtFormatted.get();//(d - context)/1000;
  }
});



Template.table1.destroyed = function() {
  Meteor.clearInterval(this.handle);
};

Template.line.helpers({
  line: function(){
    return Rests.findOne({_id: Session.get('current-id')}).que;
  }
});
