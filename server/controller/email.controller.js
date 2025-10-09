const csvParser = require("csv-parser");
const { Readable } = require("stream");
const axios = require("axios");
const transporter = require("../config/mailer.js");

const sendMailsFromSheet = async (req, res) => {
  try {
    const {
      sheetUrl,
      category,
      emailHeader,
      nameHeader,
      venue,
      selectedDate,  // used only for selection category for frontend date
      timeHeader,    // recruitment only
      panelHeader,   // recruitment only
      meetupTime,    // selection only
      dateHeader     // recruitment only (new)
    } = req.body;

    if (
      !sheetUrl ||
      !category ||
      !emailHeader ||
      !nameHeader ||
      !venue ||
      (category === "selection" && !selectedDate)
    ) {
      return res.status(402).json({
        message: "sheetUrl, category, emailHeader, nameHeader and date are required",
      });
    }

    if (category === "recruitment" && (!timeHeader || !panelHeader || !dateHeader)) {
      return res.status(402).json({
        message: "For recruitment mails, timeHeader, panelHeader and dateHeader are required",
      });
    }

    if (category === "selection" && !meetupTime) {
      return res.status(402).json({
        message: "For selection mails, meetupTime is required",
      });
    }

    // Extract Google Sheet ID from URL & fetch CSV export
    const match = sheetUrl.match(/\/d\/(.*?)\//);
    if (!match) {
      return res.status(400).json({ message: "Invalid Google Sheet link" });
    }
    const fileId = match[1];
    const csvUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=csv`;
    const response = await axios.get(csvUrl);
    const emails = [];
    const userRows = [];

    // Parse CSV and validate headers
    await new Promise((resolve, reject) => {
      Readable.from(response.data)
        .pipe(csvParser())
        .on('headers', (headers) => {
          if (!headers.includes(emailHeader)) {
            return reject(new Error(`Column "${emailHeader}" not found in CSV headers.`));
          }
          if (!headers.includes(nameHeader)) {
            return reject(new Error(`Column "${nameHeader}" not found in CSV headers.`));
          }
          if (
            category === "recruitment" &&
            (!headers.includes(timeHeader) || !headers.includes(panelHeader) || !headers.includes(dateHeader))
          ) {
            return reject(new Error(`Recruitment column headers missing required columns.`));
          }
        })
        .on('data', (row) => {
          if (emailHeader && row[emailHeader]) {
            emails.push(row[emailHeader]);
            userRows.push(row);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (emails.length === 0) {
      return res.status(400).json({ message: "No email column found in the sheet" });
    }

    const batchSize = 10;

    // Date formatter for recruitment date in dd/mm/yyyy format
    const formatDate = (dateStr) => {
      if (!dateStr) return "Date not specified";
      const [day, month, year] = dateStr.split('/');
      const dateObj = new Date(year, month - 1, day);
      if (isNaN(dateObj)) return dateStr;
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const getDaySuffix = (d) => {
        if (d > 3 && d < 21) return "th";
        switch (d % 10) {
          case 1:  return "st";
          case 2:  return "nd";
          case 3:  return "rd";
          default: return "th";
        }
      };
      const d = dateObj.getDate();
      const suffix = getDaySuffix(d);
      const m = months[dateObj.getMonth()];
      const y = dateObj.getFullYear();
      return `${d}${suffix} ${m} ${y}`;
    };

    if (category === "recruitment") {
      for (let i = 0; i < userRows.length; i += batchSize) {
        const batch = userRows.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (user) => {
            try {
              const userEmail = user[emailHeader];
              const userName = user[nameHeader] || "Candidate";
              const interviewTime = user[timeHeader] || "Not specified";
              const panelNo = user[panelHeader] || "Not specified";
              const interviewDateRaw = user[dateHeader] || "";
              const formattedInterviewDate = formatDate(interviewDateRaw);

              const htmlBody = `
                <div style="font-family: Arial, sans-serif; background-color: #E6F0FF; padding: 40px 20px; line-height: 1.6; text-align: center;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #F2F2F2; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: left; color: #333;">
                    <div style="height: 120px; overflow: hidden;">
                      <img src="https://i.ibb.co/fdzzs4MV/flower.webp" alt="Anokhi Pehel Logo" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                    </div>
                    <div style="padding: 30px;">
                      <h1 style="color: #0c1445; font-size: 30px; margin-bottom: 25px; font-weight: 800; text-align: center;">
                        Congratulations!
                      </h1>
                      <p style="font-size: 17px; margin-bottom: 15px;">Hi <strong>${userName}</strong>,</p>
                      <p style="font-size: 17px; margin-bottom: 20px;">
                        Thank you for applying for the <strong>Anokhi पहल</strong> Student Volunteer Position.
                      </p>
                      <p style="font-size: 17px; margin-bottom: 25px;">
                        We’re delighted to inform you that you have been invited to the next stage of the selection process — the interview round.
                      </p>
                      <p style="font-size: 18px; font-weight: 800; margin-bottom: 15px;">
                        The details for the interview are as follows:
                      </p>
                      <p style="font-size: 17px; margin-bottom: 30px;">
                        <strong>🕛 Time:</strong> ${interviewTime}<br>
                        <strong>📅 Date:</strong> ${formattedInterviewDate}<br>
                        <strong>👥 Panel No:</strong> ${panelNo}<br>
                        <strong>📍 Venue:</strong> ${venue}
                      </p>
                      <p style="font-size: 17px; margin-bottom: 20px;">
                        Kindly make sure to report to the venue on time.
                      </p>

                      <p style="font-size: 17px; margin-bottom: 25px;">
                        Good luck with your interview— we are eagerly , waiting to meet you in person!!   
                      </p>
                      <p style="margin-top: 30px; font-size: 17px; font-weight: 800; color: #0c1445;">
                        Warmest Regards,<br>
                        Team Anokhi पहल
                      </p>
                    </div>
                  </div>
                </div>`;

              const mailOptions = {
                from: `Anokhi Pehel <${process.env.email}>`,
                to: userEmail,
                subject: "Invitation: Anokhi Pehel Recruitment Interview",
                html: htmlBody,
              };

              await transporter.sendMail(mailOptions);
            } catch (error) {
              console.error(`Failed sending mail to ${user[emailHeader]}:`, error);
            }
          })
        );
      }

      return res.status(200).json({
        success: true,
        message: `Recruitment emails sent successfully to ${emails.length} users.`,
      });
    } else if (category === "selection") {
      for (let i = 0; i < userRows.length; i += batchSize) {
        const batch = userRows.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (user) => {
            try {
              const userEmail = user[emailHeader];
              const userName = user[nameHeader] || "Candidate";

              const htmlBody = `
                <div style="font-family: Arial, sans-serif; background-color: #E6F0FF; padding: 40px 20px; line-height: 1.6; text-align: center;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #F2F2F2; border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); text-align: left; color: #333;">
                    <div style="height: 120px; overflow: hidden;">
                      <img src="https://i.ibb.co/LDh0Dvd8/congratulations.jpg" alt="Anokhi Pehel Logo" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                    </div>
                    <div style="padding: 30px;">
                      <h1 style="color: #0c1445; font-size: 30px; margin-bottom: 25px; font-weight: 800; text-align: center;">
                        Congratulations!
                      </h1>
                      <p style="font-size: 17px; margin-bottom: 15px; color: #333;">
                        Hi <strong>${userName} 🥳</strong>,
                      </p>
                      <p style="font-size: 17px; margin-bottom: 25px; color: #333;">
                        We’re delighted to inform you that you’ve been selected for the <strong>Anokhi पहल</strong> Student Volunteer position! Your enthusiasm and sincerity stood out, and we’re excited to have you as part of our team.
                      </p>
                      <p style="font-size: 18px; font-weight: 800; color: #333; margin-bottom: 15px;">
                        The details for the briefing are as follows:
                      </p>
                      <p style="font-size: 17px; margin-bottom: 30px; color: #333;">
                        <strong style="font-weight: bold;">🕒 Time:</strong> ${meetupTime}<br>
                        <strong style="font-weight: bold;">📅 Date:</strong> ${selectedDate}<br>
                        <strong style="font-weight: bold;">📍 Venue:</strong> ${venue}
                      </p>
                      <p style="font-size: 17px; margin-bottom: 20px; color: #333;">
                        Kindly make sure to report to the venue on time.
                      </p>
                      <p style="font-size: 17px; margin-bottom: 25px; color: #333;">
                        We look forward to meeting you and beginning this journey together with utmost enthusiasm and dedication !!
                      </p>
                      <p style="margin-top: 30px; font-size: 17px; font-weight: 800; color: #0c1445;">
                        Warmest Regards,<br>
                        Team Anokhi पहल
                      </p>
                    </div>
                  </div>
                </div>`;

              const mailOptions = {
                from: `Anokhi Pehel <${process.env.email}>`,
                to: userEmail,
                subject: "Selection Confirmation - Anokhi Pehel",
                html: htmlBody,
              };

              await transporter.sendMail(mailOptions);
            } catch (error) {
              console.error(`Failed sending mail to ${user[emailHeader]}:`, error);
            }
          })
        );
      }

      return res.status(200).json({
        success: true,
        message: `Selection mails sent successfully to ${emails.length} users.`,
      });
    } else {
      return res.status(400).json({ message: "Unknown category." });
    }
  } catch (error) {
    console.error("Error sending mails:", error);
    res.status(500).json({ message: "Failed to send emails", error: error.message });
  }
};

module.exports = { sendMailsFromSheet };