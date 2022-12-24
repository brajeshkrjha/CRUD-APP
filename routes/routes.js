const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");

// Image upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image"); // Using single because we are uploading single image at a time. And "image" is written because we have given "image" name for input field

// Insert an user into database route
router.post("/add", upload, (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });
  user.save((err) => {
    if (err) {
      res.json({
        message: err.message,
        type: "danger",
      });
    } else {
      req.session.message = {
        message: "User added successfully",
        type: "success",
      };
      res.redirect("/");
    }
  });
});

// Get all users route
router.get("/", (req, res) => {
  User.find().exec((err, users) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.render("index", {
        title: "Home Page",
        users: users,
      });
    }
  });
});

router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add User Page" });
});

// Edit user route
router.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  User.findById(id, (err, user) => {
    if (err) {
      res.redirect("/");
    } else {
      if (user == null) {
        res.redirect("/");
      } else {
        res.render("edit_users", {
          title: "Edit User Page",
          user: user,
        });
      }
    }
  });
});

// Update user route
router.post("/update/:id", upload, (req, res) => {
  let id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }

  User.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          message: "User updated successfully",
          type: "success",
        };
        res.redirect("/");
      }
    }
  );
});

// Delete user route
router.get("/delete/:id", (req, res) => {
  let id = req.params.id;
  User.findByIdAndDelete(id, (err, result) => {
    if (result.image != "") {
      try {
        fs.unlinkSync("./uploads/" + result.image);
      } catch (err) {
        console.log(err);
      }
    }

    if (err) {
      res.json({ message: err.message });
    } else {
      req.session.message = {
        message: "User deleted successfully",
        type: "info",
      };
      res.redirect("/");
    }
  });
});

// About
router.get("/about", (req, res) => {
    res.render("about", { title: "About Page" });
})

module.exports = router;
