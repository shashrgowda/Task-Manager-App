const sgMail = require('@sendgrid/mail');

const apiKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(apiKey)

const welcomeEmail = (email, name) => {
   const msg = {
        to: email,
        from: 'shashankr6@gmail.com',
        subject: 'Welcome to this app which is never gonna release!',
        text: `Welcome, ${name}. How you doin'? ;)`
    }

    sgMail
  .send(msg)
  .then(() => {

  })
  .catch(err => console.log(err))
}

const accountDelete = (email, name) => {
    const msg = {
        to: email,
        from: 'shashankr6@gmail.com',
        subject: `I'll tell you all about it when I see you again :'(`,
        text: `${name}, It pains me to let you go. But, only if that what makes you happy. See you again, hopefully`
    }

    sgMail.send(msg)
    .then(() => {

    })
    .catch(err => console.log(err))
}

module.exports = {
    welcomeEmail,
    accountDelete
}