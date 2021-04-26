
const transporter = require('nodemailer').createTransport({
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.MAILUSER,
    pass: process.env.MAILPASS
  }
})

transporter.verify(error => {
  if (error) {
    console.log(error);
  } else {
    console.log('email transporter works fine');
  }
});
module.exports = transporter;