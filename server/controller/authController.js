const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const generator = require("generate-password");
const User = require("../models/User");
const {
  generateToken,
  verifyToken,
  generateTempToken,
} = require("../config/secret");
const transporter = require("../config/mailer.js");

const login = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ success, error: "Try Logging in with correct credentials" });
    }

    if (!user.isActive) {
      return res.status(200).json({
        success,
        error: "Your account is not active. Please contact admin.",
      });
    }

    const pwdCompare = await bcrypt.compare(password, user.password);
    if (!pwdCompare) {
      return res
        .status(200)
        .json({ success, error: "Try Logging in with correct credentials" });
    }

    success = true;
    const authToken = generateToken(user.id);
    res.json({ success, authToken });
  } catch (error) {
    console.error(error.message);
    res.send("Server Error");
  }
};

const getUserData = async (req, res) => {
  // Get the token from the request header
  const token = req.headers.authorization;
  // Verify and decode the token (use your own verification logic)
  if (token) {
    try {
      const decoded = verifyToken(token);

      // Extract user ID from the decoded token
      const userId = decoded.user.id;

      // Fetch user data from the database using the user ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.password = undefined;

      // Return user data as JSON
      res.json({ success: true, data: user });
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    return res.status(401).json({ message: "Token not provided" });
  }
};


//Generate link with temporary token to reset the password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    //check if an account is accossiated with entered email id
    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      return res.status(200).send({
        message: "Invaild email id",
        success: false,
      });
    }

    //Generate token if correct email id and create a link which calls API to reset password
    const token = generateTempToken(oldUser.id);
    const link = `https://anokhi-pehel.azurewebsites.net/api/v1/user/reset-password/${oldUser._id}/${token}`;
    //const link = `http://localhost:8080/api/v1/user/reset-password/${oldUser._id}/${token}`;

    //The mail content to be sent to user
    var mailOptions = {
      from: `Anokhi Pehel <${process.env.email}>`,
      to: `${email}`,
      subject: "Reset your login password",
      text: `Dear User,

      You have requested to reset your password. Please follow the link below to reset your password:
      
      ${link}
      
      If you did not request this, please ignore this email.
      
      Regards,
      Web Team,
      Anokhi Pehel`,
    };

    //Function to send mail
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.status(500).send({
          message: "Something went wrong",
          success: false,
        });
      } else {
        //console.log(link);
        return res.status(200).send({
          message: "Password reset instructions sent to your email.",
          success: true,
        });
      }
    });
  } catch (error) {
    return res.status(500).send({
      message: "Something went wrong",
      success: false,
    });
  }
};

//TO reset password
const resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.status(200).send({
      message: "Invaild email id",
      success: false,
    });
  }
  // const secret = jwtSecret + oldUser.password;

  //Generation of a random password
  const password = generator.generate({
    length: 10,
    numbers: true,
  });
  //console.log(password);
  try {
    //verify the token received as param
    const verify = verifyToken(token);
    //Hashing and updation of password in database
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    //content to be mailed
    var mailOptions = {
      from: `Anokhi Pehel <${process.env.email}>`,
      to: `${oldUser.email}`,
      subject: "Updated Password",
      text: `Dear User,
  
        You have requested to reset your password. This is your new password:
        
        ${password}
        
        Use it to login to Anokhi Pehel website and change this password after successful login.
        
        Regards,
        Web Team,
        Anokhi Pehel`,
    };

    //Function to send mail
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.status(500).send({
          message: "Something went wrong",
          success: false,
        });
      } else {
        //console.log(password);
        return res
          .status(200)
          .send(
            "New password has been sent to mail.Please Check spam section as well if not received."
          );
      }
    });
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
};


module.exports = { login, getUserData, forgotPassword, resetPassword };
