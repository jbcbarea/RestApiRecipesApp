const authServices = require("../../services/users/service.auth");

const usersRoutes = (express) => {
  const router = express.Router();

  router.post(
    "/login",
    async (req, res, next) => {
      next(); // Llama a la siguiente función en el enrutador
    },
    async (req, res) => {
      const { email, password } = req.body;
    
      try {
        const response = await authServices.login(email, password);
        res.status(200).json({ response });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  router.post("/register", async (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
      const response = await authServices.register(
        name,
        email,
        phone,
        password
      );

      res.status(200).json({ res: response });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post("/request-password-reset", async (req, res) => {
    const { email } = req.body;

    try {
      const response = await authServices.requestPasswordReset(email);
      res.status(200).json({ response });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post("/request-password-reset", async (req, res) => {
    const { email } = req.body;

    try {
      const response = await authServices.requestPasswordReset(email);
      res.status(200).json({ response });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post("/updateUserCredentials", async (req, res) => {
    const { email, oldPassword, newPassword, name, phone } = req.body;
    try {
      const result = await authServices.resetPasswordCorrectPass(
        email,
        oldPassword,
        newPassword,
        name,
        phone
      );

      if (result === true) {
        res
          .status(200)
          .json({
            success: true,
            message: "Contraseña reseteada exitosamente",
          });
      } else {
        res
          .status(200)
          .json({ success: false, message: "Credenciales inválidas" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: `Error: ${error.message}` });
    }
  });

  router.post("/updateUserCredentialsNamePhone", async (req, res) => {
    const { email, name, phone } = req.body;

    try {
      const result = await authServices.resetPasswordCorrectPassNamePhone(
        email,
        name,
        phone
      );

      if (result === true) {
        res
          .status(200)
          .json({
            success: true,
            message: "Contraseña reseteada exitosamente",
          });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Credenciales inválidas" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: `Error: ${error.message}` });
    }
  });

  return router;
};

module.exports = usersRoutes;
