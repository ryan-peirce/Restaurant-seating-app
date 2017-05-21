import '/imports/ui/pages/Dashboard.html';
import '/imports/ui/components/ownerDash.js';
import '/imports/ui/components/patronDash.js';
import '/imports/ui/components/employeeDash.js';

Template.dashboard.helpers({
   owner: function(){
       return Roles.userIsInRole(Meteor.userId(), 'owner')
   }
});
