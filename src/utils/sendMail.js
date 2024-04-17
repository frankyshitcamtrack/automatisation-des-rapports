const nodemailer = require('nodemailer');

function sendMail(from,to,pass,subject,text,filename,path) {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: from,
          pass: pass,
        },
      });

    var mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text,
        attachments: [{
            filename: filename,
            path :path,
            contentType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            contentDispositio:'attachment'
        }]
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports={sendMail}

