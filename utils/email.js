
const transporter = require('nodemailer').createTransport({
  host: 'smtp.gmail.com',
  auth: {
    user: 'itayeshet14@gmail.com',
    pass: 'rummikub20'
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