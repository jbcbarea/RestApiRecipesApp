const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:admin@localhost:5432/RecipEasy');

module.exports = { pgp, db };