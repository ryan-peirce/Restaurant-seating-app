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
	'addToQue' (userId,restId,userName,restName,party, phone, email, contactSMS, contactEmail){
		Rests.update(restId, {$push: {'que': {userId:userId, userName: userName, party: party, wait: 0, phone: phone, email: email, contactSMS: contactSMS, contactEmail: contactEmail} }});
		Meteor.users.update(userId, {$push: {'profile.inLine': {restId:restId, restName: restName, party: party, wait: 0} }});
	},
	'leaveQue' (userId,restId){
		Rests.update(restId, {$pull: {'que': {userId:userId} }});
		Meteor.users.update(userId, {$pull: {'profile.inLine': {restId:restId} }});
	},
	'editQue' (restId,que){
		Rests.update(restId, {$set: {'que': que }});
	},
	'rests.tables.toggleStatus' (restId, table, status){
		//alert(restId + ' ' + table + ' ' + status);
		//var d = new Date();
		//var n = d.getTime();
		var remaining = (40);
		if(status == 'open'){
			remaining = 0;
		}
		Rests.update({'_id':restId, 'tables.name': table}, {$set: {'tables.$.status': status, 'tables.$.time': remaining}});
	},
	'rests.tables.addTime' (restId, table, time){
		var tables = Rests.findOne({'_id': restId}).tables;
		var curTime = 0;
		for(var i = 0; i < tables.length; i++){
			if (tables[i].name === table){
				curTime = tables[i].time;
			}
		}
		time = parseInt(time)
		curTime = parseInt(curTime)
		time = time + curTime;
		Rests.update({'_id':restId, 'tables.name': table}, {$set: {'tables.$.status': 'full', 'tables.$.time': time}});
	},
	'sendEmail' :function(to, message) {
		this.unblock();
		Email.send({
		  to: to,
		  from: "no-reply@cse480.com",
		  subject: "Your wait time",
		  text: message,
		});
	},
	'sendSMS': function (to, message) {
    twilioClient.sendSMS({
      to: to,
      body: message
    });
  },
	'rests.tables.updateTime' (){
			var rest = Rests.find().fetch();
			var restNumber = rest.length;

			for(var j = 0; j < restNumber; j++){
				var tablesArray = rest[j].tables;
				var restId =  rest[j]._id;
				var tables = tablesArray.length;
				for(var i = 0; i < tables; i++){
					if(tablesArray[i].time != 0){
						tablesArray[i].time = tablesArray[i].time - 1;
					}
					Rests.update({'_id':restId}, {$set: {'tables': tablesArray}});
				}
			}
	},
	'rests.updateWaits' (){
			var rest = Rests.find().fetch();
			var restNumber = rest.length;

			for(var j = 0; j < restNumber; j++){
				var tablesArray = rest[j].tables;
				var restId =  rest[j]._id;
				var tables = tablesArray.length;
				var queArray = rest[j].que;
				var queSize = queArray.length;

				var tableOne = [], tableTwo = [], tableThree = [], tableFour = [], tableFive = [], tableSixUp = [];
				var queOne = [], queTwo = [], queThree = [], queFour = [], queFive = [], queSixUp = [];

				var tableOneAvg = 40,tableTwoAvg = 40,tableThreeAvg = 40,tableFourAvg = 40,tableFiveAvg = 40,tableSixAvg = 40;
				var tableOneWait = 0,tableTwoWait = 0,tableThreeWait = 0,tableFourWait = 0,tableFiveWait = 0,tableSixWait = 0;

				for(var i = 0; i < tables; i++){
					switch(tablesArray[i].seats){
						case '1':
							tableOne.push(tablesArray[i].time);
							break;
						case '2':
							tableTwo.push(tablesArray[i].time);
							break;
						case '3':
							tableThree.push(tablesArray[i].time);
							break;
						case '4':
							tableFour.push(tablesArray[i].time);
							break;
						case '5':
							tableFive.push(tablesArray[i].time);
							break;
						default:
							tableSixUp.push(tablesArray[i].time);
							break;
					}
				}

					tableOne.sort(function(a, b){return a-b});
					tableTwo.sort(function(a, b){return a-b});
					tableThree.sort(function(a, b){return a-b});
					tableFour.sort(function(a, b){return a-b});
					tableFive.sort(function(a, b){return a-b});
					tableSixUp.sort(function(a, b){return a-b});

					for(var i = 0; i < queSize; i++){
						switch(queArray[i].party){
							case '1':
								queOne.push(queArray[i]);
								break;
							case '2':
								queTwo.push(queArray[i]);
								break;
							case '3':
								queThree.push(queArray[i]);
								break;
							case '4':
								queFour.push(queArray[i]);
								break;
							case '5':
								queFive.push(queArray[i]);
								break;
							default:
								queSixUp.push(queArray[i]);
								break;
						}
					}


					var index = queOne.length;
					var totalTables = tableOne.length;
					var avg = tableOneAvg;
					tableOneWait = tableOne[index - (Math.floor(index/totalTables)*totalTables)] + avg*(Math.floor(index/totalTables));

					index = queTwo.length;
					totalTables = tableTwo.length;
					avg = tableTwoAvg;
					tableTwoWait = tableTwo[index - (Math.floor(index/totalTables)*totalTables)] + avg*(Math.floor(index/totalTables));

					index = queThree.length;
					totalTables = tableThree.length;
					avg = tableThreeAvg;
					tableThreeWait = tableThree[index - (Math.floor(index/totalTables)*totalTables)] + avg*(Math.floor(index/totalTables));

					index = queFour.length;
					totalTables = tableFour.length;
					avg = tableFourAvg;
					tableFourWait = calcWait(queFour.length, tableFour.length, tableFourAvg, tableFour);



					index = queFive.length;
					totalTables = tableFive.length;
					avg = tableFiveAvg;
					tableFiveWait = tableFive[index - (Math.floor(index/totalTables)*totalTables)] + avg*(Math.floor(index/totalTables));

					index = queSixUp.length;
					totalTables = tableSixUp.length;
					avg = tableSixAvg;
					tableSixWait = tableSixUp[index - (Math.floor(index/totalTables)*totalTables)] + avg*(Math.floor(index/totalTables));



					var waits = {
						one: checkNull(tableOneWait),
						two: checkNull(tableTwoWait),
						three: checkNull(tableThreeWait),
						four: checkNull(tableFourWait),
						five: checkNull(tableFiveWait),
						sixUp: checkNull(tableSixWait)
					};


					Rests.update({'_id':restId}, {$set: {'waits': waits}});

					for(var i = 0; i < queSize; i++){
						var party = queArray[i].party;
						var thisWait = 0;
						if(party == 1){
							thisWait = calcWait( i, tableOne.length, tableOneAvg, tableOne);
						}
						else if(party == 2){
							thisWait = calcWait( i, tableTwo.length, tableTwoAvg, tableTwo);
						}
						else if(party == 3){
							thisWait = calcWait( i, tableThree.length, tableThreeAvg, tableThree);
						}
						else if(party == 4){
							thisWait = calcWait( i, tableFour.length, tableFourAvg, tableFour);
						}
						else if(party == 5){
							thisWait = calcWait( i, tableFive.length, tableFiveAvg, tableFive);
						}
						else{
							thisWait = calcWait( i, tableSixUp.length, tableSixAvg, tableSixUp);
						}

						queArray[i].wait = thisWait;

						var phoneNumber = queArray[i].phone;
						var message = "Your reservation will be ready in 5 mins.";
						if(thisWait <= 5 && queArray[i].warned != true){
							console.log(phoneNumber,message);
							queArray[i].warned = true;
							if (queArray[i].contactSMS){
								Meteor.call('sendSMS', phoneNumber, message);
							}
							if (queArray[i].contactEmail){
								Meteor.call('sendEmail', queArray[i].email, message);
							}
						}

					}

					Meteor.call('editQue', restId, queArray);



				}
			}
});

calcWait = function(index, totalTables, avg, que){
	return que[index - (Math.floor(index/totalTables)*totalTables)] + avg*(Math.floor(index/totalTables));
}

checkNull = function(num){
	if(num == null || num == 'undefined' || num == NaN || num == "NaN"){
		return 0;
	}
	else{
		return num;
	}
}
