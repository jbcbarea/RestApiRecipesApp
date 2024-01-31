
const recipesRoutes = require('./recipes/routes.recipes');
const usersRoutes = require('./users/routes.users');
const fileUploadRoutes = require('./file-upload/file-upload.routes');
const ingredientsRoutes = require('./ingredients/ingredients.routes');
const favouriteRecipesRoutes = require('./favourite-recipes/routes.favourite-recipes');
const scoringRecipesRoutes = require('./recipe-score/recipe-score.routes');

const configRoutes = (app, express) => {
    app.use("/recipes", recipesRoutes(express));
    app.use("/users",usersRoutes(express))
    app.use("/upload", fileUploadRoutes(express));
    app.use("/ingredients", ingredientsRoutes(express));
    app.use("/favouriteRecipes",favouriteRecipesRoutes(express));
    app.use("/scoringRecipes",scoringRecipesRoutes(express));
   //app.use("/api/bookings", guardUser, bookingsRoutes(express));
    //app.use("/", (req, res) => res.send("Hello World! From server!"));
  };
  
  module.exports = configRoutes;