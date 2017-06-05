import '/imports/startup/server';
import '/imports/startup/both';

Meteor.startup(() => {
  process.env.MAIL_URL='smtp://postmaster%40sandbox377d914eac974ffc9d099224c7e83342.mailgun.org:5991205a2fc877b34ef5438406348796@smtp.mailgun.org:587'
});

twilioClient = new Twilio({
  from: '+13132468365',
  sid: 'AC2676c5c696c03f7c7f081df347318395',
  token: 'f4b8c82d11ffea32c937f778cfccdfc0'
});
