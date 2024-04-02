const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:admin@localhost:5432/RecipEasyPROD');

module.exports = { pgp, db };