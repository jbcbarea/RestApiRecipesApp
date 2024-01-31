//Si quiero poner middlewares o lo que sea .....
const recipesServices = require('../../services/recipes/service.recipes')

const recipesRoutes = (express) => {
    const router = express.Router();
    router
    //Si ponemos uno de recibir :id el último que si no peta!!
    .get("/planingRecipes",recipesServices.getRecipesFullPlaning)
      .get("/", (recipesServices.getRecipes))
      .get("/filter",(recipesServices.getFilteredRecipes))
      .get("/recipesWorld/:recipeWorldType",(recipesServices.getRecipesWorld))
      .get("/:id",(recipesServices.getRecipesFullById))
      .post("/createRecipe",(recipesServices.createRecipe))
      .get("/:id/image", recipesServices.getRecipeImageBase64);
      //.post("/", guardUser, getUserId, getBody, control(service.createActivity))
      //.put("/:id", debugReq, getId, getBody, control(service.updateActivity))
      //.get("/:id/bookings", (req, res) => res.send("GET /activities/:id/bookings"))
      //.delete("/:id", (req, res) => res.send("DELETE /activities"));
    return router;
  };

  module.exports = recipesRoutes;