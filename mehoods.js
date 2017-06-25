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
	'rests.tables.toggleStatus' (restId, table, status, avgWait){
		//alert(restId + ' ' + table + ' ' + status);
		//var d = new Date();
		//var n = d.getTime();
		var remaining = (avgWait);
		if(status == 'open'){
			remaining = 0;
		}
		Rests.update({'_id':restId, 'tables.name': table}, {$set: {'tables.$.status': status, 'tables.$.time': remaining}});
	},
	'updateAvgWait' (restId, one, two, three, four, five, sixUp){
		one = parseInt(one);
		two = parseInt(two);
		three = parseInt(three);
		four = parseInt(four);
		five = parseInt(five);
		sixUp = parseInt(sixUp);
		Rests.update({'_id': restId}, {$set: {'avg_wait.one': one, 'avg_wait.two': two, 'avg_wait.three': three, 'avg_wait.four': four, 'avg_wait.five': five, 'avg_wait.sixUp': sixUp}})
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
						tablesArray[i].time = checkNull(tablesArray[i].time - 1);
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
				var avgWait = rest[j].avg_wait;

				var tableOne = [], tableTwo = [], tableThree = [], tableFour = [], tableFive = [], tableSixUp = [];
				var queOne = [], queTwo = [], queThree = [], queFour = [], queFive = [], queSixUp = [];

				var tableOneAvg = avgWait.one,tableTwoAvg = avgWait.two,tableThreeAvg = avgWait.three,tableFourAvg = avgWait.four,tableFiveAvg = avgWait.five,tableSixAvg = avgWait.sixUp;
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

					var tableOneExists = false, tableTwoExists = false, tableThreeExists = false, tableFourExists = false, tableFiveExists = false, tableSixExists = false;
					var tableOneOpen = false, tableTwoOpen = false, tableThreeOpen = false, tableFourOpen = false, tableFiveOpen = false, tableSixOpen = false;

					if(tableOne.length > 0){
						tableOneExists = true;
						if(tableOneExists){
							if(tableOne[0] == 0){
								tableOneOpen = true;
							}
						}
					}

					if(tableTwo.length > 0){
						tableTwoExists = true;
						if(tableTwoExists){
							if(tableTwo[0] == 0){
								tableTwoOpen = true;
							}
						}
					}

					if(tableThree.length > 0){
						tableThreeExists = true;
						if(tableThreeExists){
							if(tableThree[0] == 0){
								tableThreeOpen = true;
							}
						}
					}

					if(tableFour.length > 0){
						tableFourExists = true;
						if(tableFourExists){
							if(tableFour[0] == 0){
								tableFourOpen = true;
							}
						}
					}

					if(tableFive.length > 0){
						tableFiveExists = true;
						if(tableFiveExists){
							if(tableFive[0] == 0){
								tableFiveOpen = true;
							}
						}
					}

					if(tableSixUp.length > 0){
						tableSixExists = true;
						if(tableSixExists){
							if(tableSixUp[0] == 0){
								tableSixOpen = true;
							}
						}
					}

					var tableOneTotal = tableOne.length,tableTwoTotal = tableTwo.length,tableThreeTotal = tableThree.length,tableFourTotal =tableFour.length,tableFiveTotal = tableFive.length,tableSixTotal = tableSixUp.length;

					for(var i = 0; i < queSize; i++){
						var queOneSize = queOne.length, queTwoSize = queTwo.length, queThreeSize = queThree.length, queFourSize = queFour.length, queFiveSize = queFive.length, queSixSize = queSixUp.length;
						//var smallestLine = [queOneSize, queTwoSize, queThreeSize, queFourSize, queFiveSize, queSixSize ];

						switch(queArray[i].party){
							case '1':
								if(tableOneOpen && queOneSize == 0){
									queOne.push(queArray[i]);
								}
								else if(tableTwoOpen && queTwoSize == 0){
									queTwo.push(queArray[i]);
								}
								else if(tableThreeOpen && queThreeSize == 0){
									queThree.push(queArray[i]);
								}
								else if(tableFourOpen && queFourSize == 0){
									queFour.push(queArray[i]);
								}
								else{
									queOne.push(queArray[i]);
								}
								break;
							case '2':
								if(tableTwoOpen && queTwoSize == 0){
									queTwo.push(queArray[i]);
								}
								else if(tableThreeOpen && queThreeSize == 0){
									queThree.push(queArray[i]);
								}
								else if(tableFourOpen && queFourSize == 0){
									queFour.push(queArray[i]);
								}
								else if(tableFiveOpen && queFiveSize == 0){
									queFive.push(queArray[i]);
								}
								else{
									queTwo.push(queArray[i]);
								}
								break;
							case '3':
								if(tableThreeOpen && queThreeSize == 0){
									queThree.push(queArray[i]);
								}
								else if(tableFourOpen && queFourSize == 0){
									queFour.push(queArray[i]);
								}
								else if(tableFiveOpen && queFiveSize == 0){
									queFive.push(queArray[i]);
								}
								else if(tableSixOpen && queSixSize == 0){
									queSixUp.push(queArray[i]);
								}
								else{
									queThree.push(queArray[i]);
								}
								break;
							case '4':
								if(tableFourOpen && queFourSize == 0){
									queFour.push(queArray[i]);
								}
								else if(tableFiveOpen && queFiveSize == 0){
									queFive.push(queArray[i]);
								}
								else if(tableSixOpen && queSixSize == 0){
									queSixUp.push(queArray[i]);
								}
								else{
									queFour.push(queArray[i]);
								}
								break;
							case '5':
								if(tableFiveOpen && queFiveSize == 0){
									queFive.push(queArray[i]);
								}
								else if(tableSixOpen && queSixSize == 0){
									queSixUp.push(queArray[i]);
								}
								else{
									queFive.push(queArray[i]);
								}
								break;
							default:
								if(tableSixOpen && queSixSize == 0){
									queSixUp.push(queArray[i]);
								}
								else{
									queSixUp.push(queArray[i]);
								}
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

					var realOneWait = [], realTwoWait = [], realThreeWait = [], realFourWait = [], realFiveWait = [], realSixWait = [];

					if(tableOneExists){
						realOneWait.push(waits.one);
					}
					if(tableTwoExists){
						realTwoWait.push(waits.two);
						realOneWait.push(waits.two);
					}
					if(tableThreeExists){
						realTwoWait.push(waits.three);
						realThreeWait.push(waits.three);
						realOneWait.push(waits.three);
					}
					if(tableFourExists){
						realThreeWait.push(waits.four);
						realTwoWait.push(waits.four);
						realOneWait.push(waits.four);
						realFourWait.push(waits.four);
					}
					if(tableFiveExists){
						realThreeWait.push(waits.five);
						realTwoWait.push(waits.five);
						realFourWait.push(waits.five);
						realFiveWait.push(waits.five);
					}
					if(tableSixExists){
						realFiveWait.push(waits.sixUp);
						realFourWait.push(waits.sixUp);
						realThreeWait.push(waits.sixUp);
						realSixWait.push(waits.sixUp);
					}

					realOneWait.sort(function(a, b){return a-b});
					realTwoWait.sort(function(a, b){return a-b});
					realThreeWait.sort(function(a, b){return a-b});
					realFourWait.sort(function(a, b){return a-b});
					realFiveWait.sort(function(a, b){return a-b});
					realSixWait.sort(function(a, b){return a-b});



					var i1 = 0, i2 = 0, i3 = 0, i4 = 0, i5 = 0, i6 = 0;
					for(var i = 0; i < queSize; i++){
						var party = queArray[i].party;
						var thisWait = 0;
						var min = -1;
						var curMin = -1;
						if(party == 1){
							if(tableTwoExists){
								thisWait1 = calcWait( i2, tableTwo.length, tableTwoAvg, tableTwo);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 1;
								}
							}
							if(tableThreeExists){
								thisWait1 = calcWait( i3, tableThree.length, tableThreeAvg, tableThree);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 2;
								}
							}
							if(tableFourExists){
								thisWait1 = calcWait( i4, tableFour.length, tableFourAvg, tableFour);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 3;
								}
							}
							if(tableOneExists){
								thisWait1 = calcWait( i1, tableOne.length, tableOneAvg, tableOne);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 1;
								}
							}
							switch(curMin){
								case 1:
									i1++;
									thisWait = min;
									break;
								case 2:
									i2++;
									thisWait = min;
									break;
								case 3:
									i3++;
									thisWait = min;
									break;
								case 4:
									i4++;
									thisWait = min;
									break;
								case 5:
									i5++;
									thisWait = min;
									break;
								case 6:
									i6++;
									thisWait = min;
									break;
							}
						}
						else if(party == 2){
							if(tableTwoExists){
								thisWait1 = calcWait( i2, tableTwo.length, tableTwoAvg, tableTwo);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 2;
								}
							}
							if(tableThreeExists){
								thisWait1 = calcWait( i3, tableThree.length, tableThreeAvg, tableThree);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 3;
								}
							}
							if(tableFourExists){
								thisWait1 = calcWait( i4, tableFour.length, tableFourAvg, tableFour);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 4;
								}
							}
							if(tableFiveExists){
								thisWait1 = calcWait( i5, tableFive.length, tableFiveAvg, tableFive);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 5;
								}
							}
							switch(curMin){
								case 1:
									i1++;
									thisWait = min;
									break;
								case 2:
									i2++;
									thisWait = min;
									break;
								case 3:
									i3++;
									thisWait = min;
									break;
								case 4:
									i4++;
									thisWait = min;
									break;
								case 5:
									i5++;
									thisWait = min;
									break;
								case 6:
									i6++;
									thisWait = min;
									break;
							}
						}
						else if(party == 3){
							if(tableThreeExists){
								thisWait1 = calcWait( i3, tableThree.length, tableThreeAvg, tableThree);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 3;
								}
							}
							if(tableFourExists){
								thisWait1 = calcWait( i4, tableFour.length, tableFourAvg, tableFour);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 4;
								}
							}
							if(tableFiveExists){
								thisWait1 = calcWait( i5, tableFive.length, tableFiveAvg, tableFive);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 5;
								}
							}
							if(tableSixExists){
								thisWait1 = calcWait( i6, tableSixUp.length, tableSixAvg, tableSixUp);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 6;
								}
							}
							switch(curMin){
								case 1:
									i1++;
									thisWait = min;
									break;
								case 2:
									i2++;
									thisWait = min;
									break;
								case 3:
									i3++;
									thisWait = min;
									break;
								case 4:
									i4++;
									thisWait = min;
									break;
								case 5:
									i5++;
									thisWait = min;
									break;
								case 6:
									i6++;
									thisWait = min;
									break;
							}
						}
						else if(party == 4){
							if(tableFourExists){
								thisWait1 = calcWait( i4, tableFour.length, tableFourAvg, tableFour);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 4;
								}
							}
							if(tableFiveExists){
								thisWait1 = calcWait( i5, tableFive.length, tableFiveAvg, tableFive);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 5;
								}
							}
							if(tableSixExists){
								thisWait1 = calcWait( i6, tableSixUp.length, tableSixAvg, tableSixUp);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 6;
								}
							}
							switch(curMin){
								case 1:
									i1++;
									thisWait = min;
									break;
								case 2:
									i2++;
									thisWait = min;
									break;
								case 3:
									i3++;
									thisWait = min;
									break;
								case 4:
									i4++;
									thisWait = min;
									break;
								case 5:
									i5++;
									thisWait = min;
									break;
								case 6:
									i6++;
									thisWait = min;
									break;
							}

					}
						else if(party == 5){
							if(tableFiveExists){
								thisWait1 = calcWait( i5, tableFive.length, tableFiveAvg, tableFive);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 5;
								}
							}
							if(tableSixExists){
								thisWait1 = calcWait( i6, tableSixUp.length, tableSixAvg, tableSixUp);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 6;
								}
							}
							switch(curMin){
								case 1:
									i1++;
									thisWait = min;
									break;
								case 2:
									i2++;
									thisWait = min;
									break;
								case 3:
									i3++;
									thisWait = min;
									break;
								case 4:
									i4++;
									thisWait = min;
									break;
								case 5:
									i5++;
									thisWait = min;
									break;
								case 6:
									i6++;
									thisWait = min;
									break;
							}

					}
						else{
							if(tableSixExists){
								thisWait1 = calcWait( i6, tableSixUp.length, tableSixAvg, tableSixUp);
								if(min == -1 || thisWait1 < min){
									min = thisWait1
									curMin = 6;
								}
							}
							switch(curMin){
								case 1:
									i1++;
									thisWait = min;
									break;
								case 2:
									i2++;
									thisWait = min;
									break;
								case 3:
									i3++;
									thisWait = min;
									break;
								case 4:
									i4++;
									thisWait = min;
									break;
								case 5:
									i5++;
									thisWait = min;
									break;
								case 6:
									i6++;
									thisWait = min;
									break;
							}

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



				Meteor.call('editQue', restId, queArray);
				}
					var min = -1;
					function lastOne(){
						min = -1;
						if(tableTwoExists){
							thisWait1 = calcWait( i2, tableTwo.length, tableTwoAvg, tableTwo);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						if(tableThreeExists){
							thisWait1 = calcWait( i3, tableThree.length, tableThreeAvg, tableThree);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						if(tableFourExists){
							thisWait1 = calcWait( i4, tableFour.length, tableFourAvg, tableFour);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						if(tableOneExists){
							thisWait1 = calcWait( i1, tableOne.length, tableOneAvg, tableOne);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						return min;
					}
					function lastTwo(){
						min = -1;
						if(tableTwoExists){
							thisWait1 = calcWait( i2, tableTwo.length, tableTwoAvg, tableTwo);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						if(tableThreeExists){
							thisWait1 = calcWait( i3, tableThree.length, tableThreeAvg, tableThree);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						if(tableFourExists){
							thisWait1 = calcWait( i4, tableFour.length, tableFourAvg, tableFour);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						if(tableFiveExists){
							thisWait1 = calcWait( i5, tableFive.length, tableFiveAvg, tableFive);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						return min;
					}
					function lastThree(){
						min = -1;
						if(tableThreeExists){
							thisWait1 = calcWait( i3, tableThree.length, tableThreeAvg, tableThree);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						if(tableFourExists){
							thisWait1 = calcWait( i4, tableFour.length, tableFourAvg, tableFour);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						if(tableFiveExists){
							thisWait1 = calcWait( i5, tableFive.length, tableFiveAvg, tableFive);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						if(tableSixExists){
							thisWait1 = calcWait( i6, tableSixUp.length, tableSixAvg, tableSixUp);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						return min
					}
					function lastFour(){
						min = -1;
						if(tableFourExists){
							thisWait1 = calcWait( i4, tableFour.length, tableFourAvg, tableFour);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						if(tableFiveExists){
							thisWait1 = calcWait( i5, tableFive.length, tableFiveAvg, tableFive);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						if(tableSixExists){
							thisWait1 = calcWait( i6, tableSixUp.length, tableSixAvg, tableSixUp);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						return min;
				}
					function lastFive(){
						min = -1;
						if(tableFiveExists){
							thisWait1 = calcWait( i5, tableFive.length, tableFiveAvg, tableFive);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						if(tableSixExists){
							thisWait1 = calcWait( i6, tableSixUp.length, tableSixAvg, tableSixUp);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						return min
				}
					function lastSix(){
						min = -1;
						if(tableSixExists){
							thisWait1 = calcWait( i6, tableSixUp.length, tableSixAvg, tableSixUp);
							if(min == -1 || thisWait1 < min){
								min = thisWait1;
							}
						}
						return min
				}

				waits.one = lastOne();
				waits.two = lastTwo();
				waits.three = lastThree();
				waits.four = lastFour();
				waits.five = lastFive();
				waits.sixUp = lastSix();

				Rests.update({'_id':restId}, {$set: {'waits': waits}});





			}}

});

calcWait = function(index, totalTables, avg, que){
	return que[index - (Math.floor(index/totalTables)*totalTables)] + avg*(Math.floor(index/totalTables));
}

checkNull = function(num){
	if(num == null || num == 'undefined' || num == NaN || num == "NaN" || (Number.isInteger(num) == false) ){
		return 0;
	}
	else{
		return num;
	}
}
