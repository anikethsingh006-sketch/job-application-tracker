const User = require("../models/User");
const bcrypt = require("bcrypt");

async function registerUser(userData) {
  const existingUser = await User.findOne({
    email: userData.email,
  });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(userData.password, 12);

  const user = await User.create({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
  });

  return user;
}

module.exports = { registerUser };
