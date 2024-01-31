//Si quiero poner middlewares o lo que sea .....
const recipeScoreServices = require('../../services/recipe-score/recipe-score.service')

const recipeScoringRoutes = (express) => {
    const router = express.Router();
    router
    .post("/createRecipeScoring",(recipeScoreServices.addRecipeScoreByUser))
    .delete("/deleteRecipeScoring",(recipeScoreServices.deleteRecipeScoreByUser))
    .post("/updateRecipeScoring",(recipeScoreServices.updateRecipeScoreByUser))
    .get("/getRecipeScoreByUser",(recipeScoreServices.getRecipesScoreByUser))
    .get("/:id",(recipeScoreServices.getRecipesScoreById))
     
    return router;
  };

  module.exports = recipeScoringRoutes;