var express = require('express');
var router = express.Router();


module.exports = (pool) => {
/* GET users listing. */
router.get('/', function (req, res, next) {
  
  pool.query('SELECT * FROM users', (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.render('error', { message: 'Error retrieving users' });
    } else {
      res.render('user', { title: 'Express', users: result.rows });
    }
  });
});

router.get('/add', (req, res, next) => {

  res.render('adduser', { title: 'Add User' });
});

router.post('/add', function (req, res, next) {
  var email = req.body.email;
  var name = req.body.name;
  var password = req.body.password;
  var role = req.body.role;

  pool.query('INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4)', [email, name, password, role], (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.render('error', { message: 'Error adding user' });
    } else {
      res.redirect('/users'); 
    }
  });
});

router.get('/delete/:id', function (req, res, next) {
  var userId = req.params.id;

  pool.query('DELETE FROM users WHERE userid = $1', [userId], (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.render('error', { message: 'Error deleting user' });
    } else {
      res.redirect('/users'); // Redirect ke halaman users setelah berhasil menghapus data
    }
  });
});


return router;
}
