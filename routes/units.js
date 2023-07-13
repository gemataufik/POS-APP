var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const { isLoggedIn, isAdmin } = require('../helpers/util')
const saltRounds = 10


module.exports = (pool) => {
/* GET users listing. */

router.get('/', function (req, res, next) {
  
  pool.query('SELECT * FROM units', (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.render('error', { message: 'Error retrieving users' });
    } else {
      res.render('goodsutil/units', { title: 'Express', users: result.rows });
    }
  });
});


router.get('/add', (req, res, next) => {
  res.render('goodsutil/add', { title: 'Add Data', current: 'user', user: req.session.user })
})

router.post('/add', async (req, res, next) => {
  try {
    const { unit,name,note} = req.body
    
    let sql = `INSERT INTO units(unit,name,note) VALUES ($1,$2,$3)`
    const data = await pool.query(sql, [unit,name,note])
    console.log('Data User Added')
    // res.json({
    //   succes:true,
    //   data: data
    // })
    res.redirect('/units')
    // res.status(200).json({ success: "Data User Added Successfully" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Error Creating Data User" })
  }
})



router.get('/edit/:userid', async (req, res, next) => {
  try {
    const { userid } = req.params
    const sql = 'SELECT * FROM units WHERE unit = $1';
    const data = await pool.query(sql, [userid])
    // console.log(data)
    res.render('users/edit', { title: 'Edit Data', current: 'user', user: req.session.user, data: data.rows[0] })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Error Getting Data User" })
  }
})

router.post('/edit/:userid', async (req, res, next) => {
  try {
    const { userid } = req.params;
    const { email, name, role } = req.body;
    let sql = `UPDATE units SET , name =$2, text = $3 WHERE unit = $4`
    await pool.query(sql, [email, name, role, userid]);
    console.log('Data User Edited');
    res.redirect('/units');
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Error Updating Data User" })
  }
})


router.get('/delete/:id', function (req, res, next) {
  var userId = req.params.id;

  pool.query('DELETE FROM units WHERE unit = $1', [userId], (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.render('error', { message: 'Error deleting user' });
    } else {
      res.redirect('/units'); 
    }
  });
});


return router;
}
