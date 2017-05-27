import '/imports/ui/pages/app.html';


Template.app.rendered = function(){
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

Template.tables.events({
  'click .accordion': function(event){
  Session.set('table-name',this.name);
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
})

Template.line.events({
  'click .accordion': function(event){
  Session.set('patron-name',this.name);
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
})

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

Template.line.helpers({
  line: function(){
    return Rests.findOne({_id: Session.get('current-id')}).que;
  }
});
