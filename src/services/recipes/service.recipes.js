//const pgp = require('pg-promise')();
//const db = pgp('postgres://postgres:admin@localhost:5432/test');

const { db } = require("../../dB/dB.js");
const fs = require("fs");
const path = require("path");

const getRecipes = async (req, res) => {
  try {
    // Realiza una consulta a la base de datos para obtener las recetas con campos específicos
    //const recipes = await db.any(`
    //  SELECT id,nombrereceta, tipo_receta, tiempo_preparacion, dificultad, puntuacion, comensales, imagenreceta
    //  FROM recetas
    //`);

    // Modifica el JSON para incluir las rutas completas de las imágenes
    //const serverUrl = "http://localhost:3000"; // Cambia esto por la URL real de tu servidor
    //const recipesWithImageUrls = recipes.map((recipe) => {
    //  return {
    //    ...recipe,
    //    imagenreceta: `${serverUrl}/${recipe.imagenreceta}`, // Modificado aquí
    //  };
    //});
    //res.json(recipesWithImageUrls);
    res.json({prueba:'dfjksdjf',prueba2: 234});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
};
const getRecipesWorld = async (req, res) => {
  try {
    const { recipeWorldType } = req.params;

    // Realiza una consulta a la base de datos para obtener las recetas con campos específicos
    const recipes = await db.any(
      `
      SELECT id, nombrereceta, tipo_receta, tiempo_preparacion, dificultad, puntuacion, comensales, imagenreceta
      FROM recetas WHERE tipo_receta_mundo = $1
    `,
      recipeWorldType
    );

    // Modifica el JSON para incluir las rutas completas de las imágenes
    const serverUrl = "http://localhost:3000"; // Cambia esto por la URL real de tu servidor
    const recipesWithImageUrls = recipes.map((recipe) => {
      return {
        ...recipe,
        imagenreceta: `${serverUrl}/${recipe.imagenreceta}`, // Modificado aquí
      };
    });

    res.json(recipesWithImageUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
};

const getRecipesFullPlaning = async (req, res) => {
  try {
    // Realiza una consulta a la base de datos para obtener todos los detalles de las recetas
    const recipeDetails = await db.any(`
      SELECT
        recetas.*,
        array_agg(ingredientes.nombre) AS ingredientes,
        array_agg(recetas_ingredientes.cantidad) AS cantidades,
        array_agg(recetas_ingredientes.unidades_metricas) AS unidades_metricas,
        array_agg(ingredientes.calorias_por_100g) AS calorias_ingrediente
      FROM
        recetas
        JOIN recetas_ingredientes ON recetas.id = recetas_ingredientes.receta_id
        JOIN ingredientes ON recetas_ingredientes.ingrediente_id = ingredientes.id
      GROUP BY
        recetas.id
    `);

    // Modifica el JSON para incluir las rutas completas de las imágenes
    const serverUrl = "http://localhost:3000"; // Cambia esto por la URL real de tu servidor
    recipeDetails.forEach((recipe) => {
      recipe.imagenreceta = `${serverUrl}/${recipe.imagenreceta}`;
    });

    res.status(200).json(recipeDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
};

const getRecipesFullById = async (req, res) => {
  try {
    const { id } = req.params;

    // Realiza una consulta a la base de datos para obtener los detalles de la receta por ID
    const recipeDetails = await db.one(
      `
    SELECT
    recetas.*,
    array_agg(ingredientes.nombre) AS ingredientes,
    array_agg(recetas_ingredientes.cantidad) AS cantidades,
    array_agg(recetas_ingredientes.unidades_metricas) AS unidades_metricas,
    array_agg(ingredientes.calorias_por_100g) AS calorias_ingrediente
  FROM
    recetas
     JOIN recetas_ingredientes ON recetas.id = recetas_ingredientes.receta_id
     JOIN ingredientes ON recetas_ingredientes.ingrediente_id = ingredientes.id
  WHERE
    recetas.id = $1
  GROUP BY
    recetas.id;
    `,
      id
    );

    // Modifica el JSON para incluir las rutas completas de las imágenes
    const serverUrl = "http://localhost:3000"; // Cambia esto por la URL real de tu servidor
    recipeDetails.imagenreceta = `${serverUrl}/${recipeDetails.imagenreceta}`;

    res.status(200).json(recipeDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
};

/*
Esta consulta utiliza LEFT JOIN para unir las tablas recetas, recetas_ingredientes, y ingredientes. Luego, utiliza la función de agregación
 array_agg para agrupar los ingredientes en un array. Asegúrate de ajustar los nombres de las columnas y las tablas según la estructura 
 real de tu base de datos.

Además, asegúrate de manejar adecuadamente las relaciones en tu modelo de datos y ajusta la consulta según sea necesario.
*/

const getFilteredRecipes = async (req, res) => {
  let num_comensales;
  const serverUrl = "http://localhost:3000"; // Cambia esto por la URL real de tu servidor
  try {
    const {
      tipoReceta,
      tiempoPreparacion,
      dificultad,
      tipoRecetaMundo,
      ingredientes,
      puntuacion,
      restric_alimentaria,
      comensales,
    } = req.query;

    // Construir la consulta principal para obtener las recetas
    let queryRecipes = `
      SELECT
        r.id
      FROM
        recetas r
        LEFT JOIN recetas_ingredientes ri ON r.id = ri.receta_id
        LEFT JOIN ingredientes i ON ri.ingrediente_id = i.id
      WHERE 1 = 1`;

    // Agregar condiciones según los parámetros proporcionados
    if (tipoReceta && tipoReceta !== "no-aply") {
      console.log("DEPURACION TIPO RECETA");
      queryRecipes += ` AND r.tipo_receta =  $1`;
    }
    if (tiempoPreparacion && tiempoPreparacion !== "0") {
      console.log("DEP PREPARACIO");
      queryRecipes += ` AND r.tiempo_preparacion >= $2`;
    }

    if (dificultad && dificultad !== "no-aply") {
      console.log("DEP DIFICULTAD");
      queryRecipes += ` AND r.dificultad = $3`;
    }

    if (comensales && comensales !== "99") {
      //TODO: //Aqui tal vez guardar los comensales que le pasas por filtro y después hacer el cambio
      // queryRecipes += ` AND r.comensales >= $4`;
      num_comensales = comensales;
    }

    if (tipoRecetaMundo && tipoRecetaMundo !== "no-aply") {
      console.log("DEP TIPo RECETA MUNDO", tipoRecetaMundo);
      queryRecipes += ` AND r.tipo_receta_mundo = $4`;
    }

    if (ingredientes) {
      if (!Array.isArray(ingredientes)) {
        queryRecipes += ` AND i.nombre = $5`;
      } else {
        queryRecipes += ` AND i.nombre = ANY($5)`;
      }
    }
    if (puntuacion && puntuacion !== "99") {
      console.log("DEP SCORE");
      queryRecipes += `AND r.puntuacion <= $6`;
    }
    if (restric_alimentaria && restric_alimentaria !== "no-aply") {
      console.log("DEP RESTRICCIO");
      queryRecipes += `AND r.restricciones_alimentos = $7`;
    }

    queryRecipes += ` GROUP BY
        r.id`;

    // Ejecutar la consulta para obtener las recetas
    const recipes = await db.any(queryRecipes, [
      tipoReceta,
      tiempoPreparacion,
      dificultad,
      tipoRecetaMundo,
      ingredientes,
      puntuacion,
      restric_alimentaria,
      comensales,
    ]);
    console.log(recipes, "Recipes!!");
    const arraySend = [];
    const finalResultofQuery = [];
    console.log(recipes);
    for (let i = 0; i < recipes.length; i++) {
      let queryGood = `
        SELECT
          recetas.id, recetas.nombrereceta, recetas.tipo_receta, recetas.tiempo_preparacion, recetas.dificultad, recetas.puntuacion, recetas.comensales, recetas.imagenreceta,
          array_agg(ingredientes.nombre) AS ingredientes,
          array_agg(recetas_ingredientes.cantidad) AS cantidades,
          array_agg(recetas_ingredientes.unidades_metricas) AS unidades_metricas,
          array_agg(ingredientes.calorias_por_100g) AS calorias_ingrediente
        FROM
          recetas
          JOIN recetas_ingredientes ON recetas.id = recetas_ingredientes.receta_id
          JOIN ingredientes ON recetas_ingredientes.ingrediente_id = ingredientes.id
        WHERE
          recetas.id = $1
        GROUP BY
          recetas.id`;

      const detailedRecipe = await db.one(queryGood, [recipes[i].id]);
      detailedRecipe.imagenreceta = `${serverUrl}/${detailedRecipe.imagenreceta}`;
      arraySend.push(detailedRecipe);
    }

    arraySend.forEach((recipeElement, index) => {
      if (areIngredientsContained(recipeElement.ingredientes, ingredientes)) {
        finalResultofQuery.push(recipeElement);
      }
    });
    res.status(200).json({ finalResultofQuery, comenFilter: num_comensales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
};

const createRecipe = async (req, res) => {
  try {
    // Extraer los parámetros del cuerpo de la solicitud
    const {
      tipo_receta,
      tipo_receta_mundo,
      tiempo_preparacion,
      fecha_creacion,
      dificultad,
      comensales,
      creado_por,
      nombreReceta,
      imagenReceta,
      pasos_receta,
      ingredientes,
    } = req.body;

    const result = await db.tx(async (t) => {
      try {
        // Insertar la receta y obtener el ID generado
        const nuevaReceta = await t.one(
          `
          INSERT INTO recetas (
            tipo_receta,
            tipo_receta_mundo,
            tiempo_preparacion,
            fecha_creacion,
            dificultad,
            comensales,
            creado_por,
            nombreReceta,
            imagenReceta,
            pasos_receta
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          ) RETURNING id;
        `,
          [
            tipo_receta,
            tipo_receta_mundo,
            tiempo_preparacion,
            fecha_creacion,
            dificultad,
            comensales,
            creado_por,
            nombreReceta,
            imagenReceta,
            pasos_receta,
          ]
        );

        // Insertar los ingredientes de la receta
        const insercionesIngredientes = ingredientes.map(
          async (ingrediente) => {
            console.log(ingrediente);
            const ingredienteId = await t.oneOrNone(
              "SELECT id FROM ingredientes WHERE nombre = $1 LIMIT 1",
              [ingrediente.ingredient]
            );

            if (ingredienteId) {
              return t.none(
                `
              INSERT INTO recetas_ingredientes (receta_id, ingrediente_id, cantidad, unidades_metricas)
              VALUES
                ($1, $2, $3, $4);
            `,
                [
                  nuevaReceta.id,
                  ingredienteId.id,
                  ingrediente.quantity,
                  ingrediente.measurement,
                ]
              );
            } else {
              // Manejar el caso en el que el ingrediente no existe
              console.error(
                `Ingrediente no encontrado: ${ingrediente.ingredient}`
              );
              // Puedes lanzar un error, ignorar el ingrediente o tomar alguna otra acción.
            }
          }
        );

        // Ejecutar todas las inserciones de ingredientes
        await t.batch(insercionesIngredientes);

        // Devolver el ID de la nueva receta
        return nuevaReceta.id;
      } catch (error) {
        // Manejar el error y enviar una respuesta de error al cliente
        console.error("Error al crear la receta:", error);
        throw error; // Re-lanzar el error para detener la ejecución y evitar que la transacción continúe
      }
    });

    // Enviar la respuesta con el ID de la nueva receta
    res.json({ nueva_receta_id: result });
  } catch (error) {
    // Manejar el error y enviar una respuesta de error al cliente
    console.error("Error al crear la receta:", error);
    res.status(500).json({ error: "Error al crear la receta" });
  }
};

/*
La parte LEFT JOIN ingredientes ON recetas_ingredientes.ingrediente_id = ingredientes.id de la consulta SQL establece una unión 
izquierda entre las tablas recetas_ingredientes e ingredientes utilizando la condición de igualdad 
recetas_ingredientes.ingrediente_id = ingredientes.id.

Esta unión izquierda significa que todas las filas de la tabla recetas se incluirán en el resultado, 
y si hay coincidencias en la tabla recetas_ingredientes y ingredientes, también se incluirán esas filas.
Si no hay coincidencias, las columnas de ingredientes tendrán valores nulos.

La cláusula WHERE 1 = 1 es simplemente una convención para facilitar la construcción dinámica de la consulta.
 No afecta el resultado de la consulta, pero permite agregar condiciones adicionales de manera más sencilla
  en el código JavaScript sin tener que preocuparse por si ya hay una cláusula WHERE presente. 
  Puedes agregar condiciones adicionales con AND después de esta cláusula, y siempre será verdadera,
   por lo que no afectará el resultado final. Es solo una convención de estilo para hacer que la construcción de
    consultas dinámicas sea más fácil en algunos casos.

*/

const getRecipeImageBase64 = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.oneOrNone(
      "SELECT imagenreceta FROM recetas WHERE id = $1",
      [id]
    );
    if (!result) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }
    const imagePath = path.join(
      "C:\\Users\\jbcor\\ionicProyects\\RestApiRecipesApp",
      result.imagenreceta
    );
    const imageLogoPath = path.join(
      "C:\\Users\\jbcor\\ionicProyects\\RestApiRecipesApp\\images\\img\\logoApp.png"
    );
    const base64Image = fs.readFileSync(imagePath, { encoding: "base64" });
    const base64Logo = fs.readFileSync(imageLogoPath, { encoding: "base64" });
    console.log(result.imagenreceta);
    res.json({ base64: base64Image, base64Logo: base64Logo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
};

function areIngredientsContained(array1, array2) {
  // Verifica si ambos arrays existen
  if (!array1 || !array2) {
    return false;
  }

  if (Array.isArray(array2)) {
    const set1 = new Set(array1);
    const set2 = new Set(array2);

    for (const ingredient of set2) {
      if (!set1.has(ingredient)) {
        return false;
      }
    }
  } else {
    const set1 = new Set(array1);
    for (const ingrede of set1) {
      if (ingrede !== array2) {
        return false;
      }
    }
  }
  return true;
}

const recipesServices = {
  getRecipes,
  getRecipesFullById,
  getFilteredRecipes,
  createRecipe,
  getRecipesWorld,
  getRecipesFullPlaning,
  getRecipeImageBase64,
};

module.exports = recipesServices;
