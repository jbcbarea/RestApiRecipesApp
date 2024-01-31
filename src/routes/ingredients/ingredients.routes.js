//Si quiero poner middlewares o lo que sea .....
const ingredientsServices = require('../../services/ingredients/ingredients.service')

const recipesRoutes = (express) => {
    const router = express.Router();
    router
      .get("/", (ingredientsServices.getAllIngredients))
      .get("/ingredientName",(ingredientsServices.getAllIngredientsName))
      .post("/addNewIngredient",(ingredientsServices.addNewIngredient))
      //.post("/", guardUser, getUserId, getBody, control(service.createActivity))
      //.put("/:id", debugReq, getId, getBody, control(service.updateActivity))
      //.get("/:id/bookings", (req, res) => res.send("GET /activities/:id/bookings"))
      //.delete("/:id", (req, res) => res.send("DELETE /activities"));
    return router;
  };

  module.exports = recipesRoutes;