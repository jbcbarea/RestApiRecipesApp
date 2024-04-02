//const pgp = require('pg-promise')();
//const db = pgp('postgres://postgres:admin@localhost:5432/test');

const {db} = require('../../dB/dB.js');

const getAllIngredients = async (req, res) => {
  try {
    // Realiza una consulta a la base de datos para obtener todos los ingredientes
    const ingredientes = await db.any('SELECT * FROM ingredientes');
    
    // Organiza los ingredientes en el formato deseado (ver JSON anteriormente especificado)
    const ingredientesPorTipo = ingredientes.reduce((acc, ingrediente) => {
      const { tipo, nombre, calorias_por_100g, grasas_por_100g, proteinas_por_100g } = ingrediente;
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push({ nombre, calorias_por_100g, grasas_por_100g, proteinas_por_100g });
      return acc;
    }, {});
    res.status(200).json({ ingredientes: ingredientesPorTipo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error en la base de datos' });
  }
};

const getAllIngredientsName = async (req,res) => {
  try {
    // Realizar una consulta a la base de datos para obtener solo los nombres de ingredientes
    const result = await db.any('SELECT nombre FROM ingredientes');

    const ingredientNames = result.map(row => row.nombre);

    res.status(200).json(ingredientNames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
};

const addNewIngredient = async (req,res) => {
  try {
    const { tipo,nombre,calorias,grasas,proteinas } = req.body;

    const ingredientExist = await db.oneOrNone(
      'SELECT id FROM ingredientes WHERE tipo = $1 AND nombre = $2',
      [tipo, nombre]
    );

    if (ingredientExist) {
      res.json({ message: 'El ingrediente que intentas crear ya existe' });
    } else {
      const result = await db.one(
        'INSERT INTO ingredientes (tipo, nombre, calorias_por_100g, grasas_por_100g, proteinas_por_100g) VALUES ($1, $2, $3,$4,$5) RETURNING *',
        [tipo, nombre,calorias,grasas,proteinas]
      );

      res.json({ message: 'Ingrediente añadidocon éxito', ingredient: result });
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
};


module.exports = {
  getAllIngredients,
  getAllIngredientsName,
  addNewIngredient
};
