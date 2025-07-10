const sgMail = require("@sendgrid/mail");

exports.handler = async (event) => {
  try {
    const { title, description, email } = JSON.parse(event.body);

    if (!title || !description || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing fields" }),
      };
    }

    sgMail.setApiKey(process.env.SENDGRID_KEY);

    const msg = {
      to: email,
      from: "okuhlecharlieman72@gmail.com", // must match SendGrid verified sender
      subject: `New Ticket: ${title}`,
      text: description,
      html: `<strong>${description}</strong>`,
    };

    await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
