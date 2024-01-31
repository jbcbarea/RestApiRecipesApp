//const pgp = require("pg-promise")();
//const db = pgp("postgres://postgres:admin@localhost:5432/test");

const {db} = require('../../dB/dB.js');

const getRecipesScoreById = async (req, res) => {
  //TODO: LLamar a este para que lo meta en base de datos en recetas ahora
  try {
    const { id } = req.params;

    // Realiza una consulta a la base de datos para obtener los detalles de la receta por ID
    const recipeScore = await db.oneOrNone(
      `
        SELECT 
               COALESCE(SUM(pr.puntuacion), 0) as total_puntuacion, 
               COALESCE(SUM(pr.votos), 0) as total_votos
        FROM recetas r
        LEFT JOIN puntuaciones_recetas pr ON pr.receta_id = r.id
        WHERE r.id = $1
        GROUP BY r.id;
      `,
      id
    );

    /*
         COALESCE is applied to each SUM function separately, ensuring that if there are no votes or points, the result will be 0 instead of NULL.

With the corrected query, the average calculation in your JavaScript code should work as expected:
      */
    if (recipeScore) {
      const { total_puntuacion, total_votos } = recipeScore;
      const averageScore = total_votos > 0 ? total_puntuacion / total_votos : 0;
      await db.none(
        "UPDATE recetas SET puntuacion = $2, votos = $3 WHERE id = $1",
        [id, averageScore, total_votos]
      );

      res.status(200).json({ ...recipeScore, averageScore });
    } else {
      res.status(404).json({ error: "Receta no encontrada" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
};

const getRecipesScoreByUser = async (req, res) => {
  try {
    const { recipeId, userEmail } = req.query;
    // Realiza una consulta a la base de datos para obtener los detalles de la receta por ID
    const recipeScoreUser = await db.oneOrNone(
      `
        SELECT pr.puntuacion
        FROM recetas r
        LEFT JOIN puntuaciones_recetas pr ON pr.receta_id = r.id
        WHERE r.id = $1 AND pr.usuario_mail = $2
        GROUP BY pr.puntuacion;
      `,
      [recipeId, userEmail]
    );

    res.status(200).json({ recipeScoreUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
};

const addRecipeScoreByUser = async (req, res) => {
  try {

    const {recipeId,userEmail,recipeScoring} = req.query;
    console.log(req.query);

    //TODO: Lo tengo que meter en puntuaciones aquí también


    const result = await db.one(
      "INSERT INTO puntuaciones_recetas (receta_id, usuario_mail, puntuacion, votos) VALUES ($1,$2, $3,1)  RETURNING *",
      [recipeId, userEmail, recipeScoring]
    );
    /*
    O si lo pruebo sin el result creo que va a  tirar ya verás ....
Cuando utilizas RETURNING *, la consulta devuelve los datos del nuevo registro que se ha insertado.
 De esta manera, después de realizar la inserción, obtienes los datos actualizados del registro,
  lo cual puede ser útil para confirmar que la operación fue exitosa y obtener cualquier valor calculado o
   modificado por la base de datos (por ejemplo, un ID automático o una marca de tiempo).
    */

    res.json({ message: "Receta puntuada correctamente",result:result});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
};

const deleteRecipeScoreByUser = async (req, res) => {
  try {
    const { recipeId, userEmail } = req.query;

      await db.none(
        "DELETE FROM puntuaciones_recetas WHERE receta_id = $1 AND usuario_mail = $2",
        [recipeId, userEmail]
      );

      res.json({ message: "Puntuación eliminada correctamente." });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
};

const updateRecipeScoreByUser = async (req, res) => {
  try {
    const { recipeId, userEmail, newRecipeScoring } = req.query;

   
    const existingVote = await db.oneOrNone(
      "SELECT id, puntuacion, votos FROM puntuaciones_recetas WHERE receta_id = $1 AND usuario_mail = $2",
      [recipeId, userEmail]
    );

    if (!existingVote) {
      res
        .status(404)
        .json({
          message: "La receta aún no ha sido puntuada por este usuario.",
        });
    } else {
      const updatedVote = await db.one(
        "UPDATE puntuaciones_recetas SET puntuacion = $1 WHERE id = $2 RETURNING puntuacion, votos",
        [newRecipeScoring, existingVote.id]
      );

      res.json({
        message: "Puntuación actualizada correctamente",
        updatedScore: updatedVote,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
};

const recipesScoringServices = {
  getRecipesScoreById,
  addRecipeScoreByUser,
  deleteRecipeScoreByUser,
  updateRecipeScoreByUser,
  getRecipesScoreByUser,
};

module.exports = recipesScoringServices;
