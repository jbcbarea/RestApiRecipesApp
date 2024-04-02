//const pgp = require('pg-promise')();
//const db = pgp('postgres://postgres:admin@localhost:5432/test');

const {db} = require('../../dB/dB.js');

const checkFavouriteRecipe = async (req,res) => {
  try {
    const { userEmail, recipeId } = req.query;
    // Comprueba si la receta ya está marcada como favorita para el usuario
    const isFavourite = await db.oneOrNone(
      'SELECT favorita FROM recetas_favoritas WHERE usuario_email = $1 AND receta_id = $2',
      [userEmail, recipeId]
    );

      res.json(isFavourite);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
};

const addFavouriteRecipe = async (req, res) => {
    try {
      const { userEmail, recipeId } = req.query;

  
  
      // Comprueba si la receta ya está marcada como favorita para el usuario
      const isFavourite = await db.oneOrNone(
        'SELECT favorita FROM recetas_favoritas WHERE usuario_email = $1 AND receta_id = $2',
        [userEmail, recipeId]
      );
  
      if (isFavourite) {
        // La receta ya está marcada como favorita, puedes manejar esto según tus necesidades
        res.json({ message: 'La receta ya está marcada como favorita.' });
      } else {
        // La receta no está marcada como favorita, agrégala como favorita
        const result = await db.one(
          'INSERT INTO recetas_favoritas (usuario_email, receta_id, favorita) VALUES ($1, $2, true) RETURNING *',
          [userEmail, recipeId]
        );
  
        res.json({ message: 'Receta agregada como favorita', favorita: result });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en la base de datos' });
    }
  };
  
  const removeFavouriteRecipe = async (req, res) => {
    try {
      const { userEmail, recipeId } = req.query;
      
    
      // Verifica si la receta está marcada como favorita para el usuario
      const isFavorita = await db.oneOrNone(
        'SELECT id FROM recetas_favoritas WHERE usuario_email = $1 AND receta_id = $2',
        [userEmail, recipeId]
      );
  
      if (!isFavorita) {
        // La receta no está marcada como favorita, puedes manejar esto según tus necesidades
        res.json({ message: 'La receta no está marcada como favorita.' });
      } else {
        // La receta está marcada como favorita, elimínala de las favoritas
        await db.none(
          'DELETE FROM recetas_favoritas WHERE usuario_email = $1 AND receta_id = $2',
          [userEmail, recipeId]
        );
  
        res.json({ message: 'Receta eliminada de las favoritas.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en la base de datos' });
    }
  };
  const getFavouriteRecipesForUser = async (req, res) => {
    try {
      const { userEmail } = req.query;
      const favouriteRecipes = await db.any(`
        SELECT recetas.id, recetas.nombrereceta, recetas.tipo_receta, recetas.tiempo_preparacion, recetas.dificultad, recetas.puntuacion, recetas.comensales, recetas.imagenreceta, recetas_favoritas.favorita
        FROM recetas_favoritas
        JOIN recetas ON recetas_favoritas.receta_id = recetas.id
        WHERE recetas_favoritas.usuario_email = $1;
      `, [userEmail]);
      const serverUrl = 'http://localhost:3000';
      const favRecipesWithImageUrls = favouriteRecipes.map(recipe => {
        return {
          ...recipe,
          imagenreceta: `${serverUrl}/${recipe.imagenreceta}` // Modificado aquí
        };
      });

      res.json(favRecipesWithImageUrls);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en la base de datos' });
    }
  };
  
  const favouriteRecipesServices ={
   addFavouriteRecipe,
   removeFavouriteRecipe,
   getFavouriteRecipesForUser,
   checkFavouriteRecipe
  };

  module.exports = favouriteRecipesServices;
