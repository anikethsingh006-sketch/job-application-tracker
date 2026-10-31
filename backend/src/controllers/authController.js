const { registerUser, loginUser } = require("../services/authService");

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

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, email ? password : password);

    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }

      req.session.userId = user._id.toString();

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 401
          ? "Invalid email or password"
          : "Internal server error",
    });
  }
}

module.exports = { register, login };
