const nodemailer = require('nodemailer');
var nodeoutlook = require('nodejs-nodemailer-outlook')

/* async function sendMail(from,to,pass,subject,text,filename,path) {
 
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: true, // Use `true` for port 465, `false` for all other ports
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
        }]
    };

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
} */

async function sendMail(from,to,pass,subject,text,filename,path) {

    nodeoutlook.sendEmail({
        auth: {
            user: from,
            pass: pass
        },
        from: from,
        to: to,
        subject: subject,
        text: text,
        attachments: [{
            filename: filename,
            path :path,
            contentType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }],
        onError: (e) => console.log(e),
        onSuccess: (i) => console.log(i)
    })

}
    

module.exports={sendMail}

