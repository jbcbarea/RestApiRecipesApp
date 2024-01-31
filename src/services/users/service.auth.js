// services/users/service.auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
//const pgp = require('pg-promise')();
//const db = pgp('postgres://postgres:admin@localhost:5432/test');

const {db} = require('../../dB/dB.js');

const smtpTransport = require('nodemailer-smtp-transport');

const login = async (email, password) => {
    try {
        const user = await db.oneOrNone('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (!user) {
            const credentials = 'Credenciales inválidas';
            return credentials;
        }

        const passwordMatch = await bcrypt.compare(password, user.contrasena);

        if (!passwordMatch) {
            const credentials = 'Credenciales inválidas';
            return credentials;
        } else {
            const token = jwt.sign({ userId: user.id, email: user.email, rol: user.rol }, 'clave-super-secreta', { expiresIn: '1h' });
            return token;
        }
    } catch (error) {
        throw new Error('Error en la autenticación');
    }
};

const register = async (name, email, phone, password) => {
    try {
        const existingUser = await db.oneOrNone('SELECT * FROM usuarios WHERE email = $1', [email]);
        console.log('ExistingUser',existingUser);
        if (existingUser !== null) {
            return 'El email ya está registrado';
        }
        console.log('pasa por aquii!!');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        await db.none('INSERT INTO usuarios (nombre, email, telefono, contrasena, rol) VALUES ($1, $2, $3, $4, $5)', [name, email, phone, hashedPassword, 'user']);
        return 'Registro exitoso';
    } catch (error) {
        throw new Error('Error en el registro');
    }
};

const registerAdmin = async (name, email, phone, password) => {
    try {
        const existingUser = await db.oneOrNone('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (existingUser) {
            return 'El email ya está registrado';
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.none('INSERT INTO usuarios (nombre, email, telefono, contrasena, rol) VALUES ($1, $2, $3, $4, $5)', [name, email, phone, hashedPassword, 'admin']);
        return 'Registro exitoso';
    } catch (error) {
        throw new Error('Error en el registro');
    }
};

const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: 'AdmRecipEasy@hotmail.com',
      pass: 'Recipeasy24',
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false, // OJO: Esto desactiva la verificación del certificado, úsalo con precaución
    },
  });

  
  const generateSecureToken = () => {
    return crypto.randomBytes(10).toString('hex');
  };
  
  const sendPasswordResetEmail = (to, resetPassword) => {
    const mailOptions = {
      from: 'AdmRecipEasy@hotmail.com',
      to,
      subject: 'Restablecimiento de Contraseña',
      html: `<p>Introduce la contraseña que ha sido enviada al email para hacer Log in en la aplicación.</p><p><strong>${resetPassword}</strong></p>`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo electrónico:', error);
      } else {
        console.log('Correo electrónico enviado:', info.response);
      }
    });
  };
  
  const requestPasswordReset = async (email) => {
    try {

      console.log(email);
   
      const user = await db.oneOrNone('SELECT * FROM usuarios WHERE email = $1', [email]);
      if (!user) {
        return 'Usuario no encontrado';
      }
  
      const resetToken = generateSecureToken();
      const hashedPassword = await bcrypt.hash(resetToken, 10);
      await db.none('UPDATE usuarios SET contrasena= $1 WHERE id = $2', [hashedPassword, user.id]);
  
      // Envia el correo electrónico con el enlace de restablecimiento de contraseña
      const resetPassword = `${resetToken}`;
      sendPasswordResetEmail(email, resetPassword);
  
      return 'Se ha enviado un correo electrónico con instrucciones para restablecer la contraseña';
    } catch (error) {
      throw new Error('Error al solicitar el restablecimiento de contraseña');
    }
  };
  
  //TODO: Creo que este método no lo uso para nada quitarlño vale??
  const resetPassword = async (token, newPassword) => {
    try {
      const user = await db.oneOrNone('SELECT * FROM usuarios WHERE reset_token = $1 AND reset_token_expires > NOW()', [token]);
      if (!user) {
        return 'Token inválido o expirado';
      }
      // Actualiza la contraseña y borra el token
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.none('UPDATE usuarios SET contrasena = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2', [hashedPassword, user.id]);

      return 'Contraseña restablecida exitosamente';
    } catch (error) {
      throw new Error('Error al restablecer la contraseña');
    }
  };

  const resetPasswordCorrectPass = async (email, oldPassword, newPassword, name, phone) => {
    try {
        const user = await db.oneOrNone('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (!user) {
            throw new Error('Credenciales inválidas');
        }
        const passwordMatch = await bcrypt.compare(oldPassword, user.contrasena);
        if (passwordMatch) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await db.none(
                'UPDATE usuarios SET nombre = $1, telefono = $2, contrasena = $3, rol = $4 WHERE id = $5',
                [name, phone, hashedPassword, 'user', user.id]
            );

            return true; // Éxito al cambiar la contraseña
        } else {
          return false;
           
        }
    } catch (error) {
        throw new Error(`Error reseteando contraseña: ${error.message}`);
    }
};

const resetPasswordCorrectPassNamePhone = async (email, name, phone) => {
  try {
      const user = await db.oneOrNone('SELECT * FROM usuarios WHERE email = $1', [email]);
      if (!user) {
          throw new Error('Credenciales inválidas');
      }
          await db.none(
              'UPDATE usuarios SET nombre = $1, telefono = $2, rol = $3 WHERE id = $4',
              [name, phone, 'user', user.id]
          );
          return true; // Éxito al cambiar la contraseña
  } catch (error) {
      throw new Error(`Error reseteando contraseña: ${error.message}`);
  }
};

module.exports = {
    login,
    register,
    registerAdmin,
    resetPassword,
    requestPasswordReset,
    resetPasswordCorrectPass,
    resetPasswordCorrectPassNamePhone
};

