const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();

// Load SendGrid key
sgMail.setApiKey(functions.config().sendgrid.key);

// Trigger on new ticket creation
exports.sendTicketEmail = functions.database
  .ref("/tickets/{ticketId}")
  .onCreate(async (snapshot, context) => {
    const ticket = snapshot.val();

    const msg = {
      to: "okuhle@heartfm.co.za", // <-- Replace with your actual support or admin email
      from: "okuhlecharlieman72@gmail.com", // <-- Must be a verified sender in SendGrid
      subject: `New Ticket Logged: ${ticket.title}`,
      html: `
        <h2>New Ticket Submitted</h2>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Description:</strong> ${ticket.description}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p><strong>Logged By:</strong> ${ticket.loggedBy}</p>
        <p><strong>Logged For:</strong> ${ticket.loggedFor || "N/A"}</p>
        <p><strong>Date:</strong> ${ticket.createdAt}</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log("Ticket email sent.");
    } catch (error) {
      console.error("Error sending ticket email:", error.toString());
    }
  });
