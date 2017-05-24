'use strict';
const nodemailer = require('nodemailer'),
    claves = require('./../config/config.json'),
    fs = require('fs'),
    path = require('path');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
        user: claves.emailUsername,
        pass: claves.emailPassword
    }
});

module.exports = {
    sendEmail: function(emailObject, cb){
        if(!cb) cb = () => {};
        let mailOptions = {
            from: emailObject.from, // sender address
            to: emailObject.to, // list of receivers
            subject: emailObject.subject, // Subject line
            html: emailObject.html, // html body
            attachments: [{
                filename: emailObject.image,
                path: path.join(__dirname, 'imgs', emailObject.image),
                cid: 'emailImage'
            }]
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return cb(error, null);
            if(process.env.NODE_ENV !== 'test')
                console.log(`Message ${info.messageId} sent: ${info.response}`);

            cb(null, `Message ${info.messageId} sent: ${info.response}`);
        });
    },
    sendEmailPlain: function(emailObject, cb){
        if(!cb) cb = () => {};
        let mailOptions = {
            from: emailObject.from, // sender address
            to: emailObject.to, // list of receivers
            subject: emailObject.subject, // Subject line
            text: emailObject.text // text body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return cb(error, null);
            if(process.env.NODE_ENV !== 'test')
                console.log(`Message ${info.messageId} sent: ${info.response}`);
            
            cb(null, `Message ${info.messageId} sent: ${info.response}`);
        });
    }
};