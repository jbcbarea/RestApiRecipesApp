//Si quiero poner middlewares o lo que sea .....
const favouriteRecipesService = require('../../services/favourite-recipes/service.favourite-recipes')

const favouriteRecipesRoutes = (express) => {
    const router = express.Router();
    router
      .get("/", (favouriteRecipesService.getFavouriteRecipesForUser))
      .post("/addFavouriteRecipe",(favouriteRecipesService.addFavouriteRecipe))
      .delete("/deleteFavouriteRecipe",(favouriteRecipesService.removeFavouriteRecipe))
      .get("/checkFavouriteRecipe",(favouriteRecipesService.checkFavouriteRecipe))
      //.post("/", guardUser, getUserId, getBody, control(service.createActivity))
      //.put("/:id", debugReq, getId, getBody, control(service.updateActivity))
      //.get("/:id/bookings", (req, res) => res.send("GET /activities/:id/bookings"))
      //.delete("/:id", (req, res) => res.send("DELETE /activities"));
    return router;
  };

  module.exports = favouriteRecipesRoutes;