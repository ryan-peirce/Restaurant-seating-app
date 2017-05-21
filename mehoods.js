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
		}

	},
	'updateWorksAt'(email,restId,rest,pos){
		var id = Meteor.users.findOne({'emails.address':email})._id
		Meteor.users.update(id, {$push: {'profile.worksAt': {restId:restId, restName:rest, position: pos} }});
}
});
