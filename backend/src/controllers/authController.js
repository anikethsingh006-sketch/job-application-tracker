const { registerUser } = require("../services/authService");

async function register(req, res) {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(error.statusCode || (error.code === 11000 ? 409 : 500)).json({
      success: false,
      message:
        error.statusCode === 409 || error.code === 11000
          ? "Email is already registered"
          : "Internal server error",
    });
  }
}

module.exports = { register };
