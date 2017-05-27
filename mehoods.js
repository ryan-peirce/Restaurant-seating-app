import { check } from 'meteor/check';

Meteor.methods({
	'rests.remove'(restId) {
    check(restId, String);
	Rests.remove(restId);
  },
	'rests.update'(restId,field,val) {
		check(restId, String);
		check(field, String);
		check(val, String);
		switch(field){
			case 'name':
				Rests.update(restId, {$set: { name: val },});
				break;
			case 'location':
				Rests.update(restId, {$set: { location: val },});
				break;
			case 'kitchen_output':
				Rests.update(restId, {$set: { kitchen_output: val },});
				break;
		}

	},
	'rests.remove-employee'(restId, user){
		var id = Meteor.users.findOne({'emails.address':user.employee_email})._id
		Meteor.users.update(id, {$pull: {'profile.worksAt': {restId:restId} }});
		Rests.update(restId, {$pull: { employees: { employee_email: user.employee_email } } });
	},
	'updateWorksAt'(email,restId,rest,pos){
		var id = Meteor.users.findOne({'emails.address':email})._id
		Meteor.users.update(id, {$push: {'profile.worksAt': {restId:restId, restName:rest, position: pos} }});
	},
	'worksAt.remove' (userId,rest){
		Meteor.users.update(userId, {$pull: {'profile.worksAt': rest }});
		Rests.update(rest.restId, {$pull: { employees: {employee_email: Meteor.user().emails[0].address} }});
	},
	'rests.addTable'(restId,tableName,seats){
		Rests.update(restId, {$push: { tables: {name: tableName, seats: seats, status:"open"} }});
	},
	'addToQue' (userId,restId,userName,restName){
		Rests.update(restId, {$push: {'que': {userId:userId, userName: userName} }});
		Meteor.users.update(userId, {$push: {'profile.inLine': {restId:restId, restName: restName} }});
	},
	'leaveQue' (userId,restId,userName,restName){
		Rests.update(restId, {$pull: {'que': {userId:userId, userName: userName} }});
		Meteor.users.update(userId, {$pull: {'profile.inLine': {restId:restId, restName: restName} }});
	}
});
