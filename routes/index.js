var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const { isLoggedIn } = require('../helpers/util');
const saltRounds = 10;

module.exports = function (db) {

  /* GET home page. */
  router.get('/register', function (req, res, next) {
    res.render('register', { title: 'Express' });
  });

  router.post('/register', async function (req, res, next) {
    const { email, password, repassword } = req.body

    try {
      if (password !== repassword) return res.send("password doesn't match")

      const { rows } = await db.query(`SELECT * FROM users WHERE email  = $1`, [email])

      if (rows.length > 0) return res.send("user doesn't exist")

      const hash = bcrypt.hashSync(password, saltRounds);

      await db.query('INSERT INTO users(email,password) VALUES ($1, $2)', [email, hash])

      res.redirect('/login')

    } catch (e) {
      res.send('gagal')

    }
  });


  router.get('/login', function (req, res, next) {
    res.render('login', { info:  req.flash('info') });
  });

  router.post('/login', async function (req, res, next) {
    const { email, password } = req.body

    try {
      const { rows } = await db.query(`SELECT * FROM users WHERE email  = $1`, [email])

      if (rows.length == 0) { 
        req.flash('info', "user doesn't exist")
        return res.redirect('/login')
      }

      if (!bcrypt.compareSync(password,  rows[0].password)){ 
        req.flash('info', "password is wrong")
        return res.redirect('/login')
      }

      req.session.user = rows[0]

      res.redirect('/')
    } catch (e) {
      res.send('gagal login')
    }

  });

  router.get('/logout', function (req, res, next) {
    req.session.destroy(function(err) {
      res.redirect('/login')
    })
  });

  router.get('/',isLoggedIn, function (req, res, next) {
    res.render('dashboard/index', { title: 'Express' });
  });



  return router;
}
