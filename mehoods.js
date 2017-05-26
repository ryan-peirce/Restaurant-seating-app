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
	'updateWorksAt'(email,restId,rest,pos){
		var id = Meteor.users.findOne({'emails.address':email})._id
		Meteor.users.update(id, {$push: {'profile.worksAt': {restId:restId, restName:rest, position: pos} }});
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
