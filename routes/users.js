var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const saltRounds = 10


module.exports = (pool) => {

  router.get('/', function (req, res, next) {
    let sql = 'select * from users';
    pool.query(sql, (err, data) => {
      if (err) {
        console.error(err);
      } 
        res.render('users/index', {
          data: data.rows,
          user: req.session.user,
          error: req.flash("error"),
        });
    });
  }); 
  

  router.get('/add', (req, res, next) => {
    
    res.render('users/add', { 
    title: 'Add Data',
     current: 'user', 
     user: req.session.user })
  })


  router.post('/add', async (req, res, next) => {
    try {
      const { email, name, password, role } = req.body
      const hash = bcrypt.hashSync(password, saltRounds);
      let sql = `INSERT INTO users(email,name,password,role) VALUES ($1,$2,$3,$4)`
      const data = await pool.query(sql, [email, name, hash, role])
      console.log('Data User Added')
     
      res.redirect('/users')
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Error Creating Data User" })
    }
  })


  router.get('/edit/:userid', async (req, res, next) => {
    try {
      const { userid } = req.params
      const sql = 'SELECT * FROM users WHERE userid = $1';
      const data = await pool.query(sql, [userid])
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
      let sql = `UPDATE users SET email = $1, name =$2, role = $3 WHERE userid = $4`
      await pool.query(sql, [email, name, role, userid]);
      console.log('Data User Edited');
      res.redirect('/users');
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Error Updating Data User" })
    }
  })


  router.get('/delete/:userid', async (req, res, next) => {
    try {
      const { userid } = req.params;
      let sql = `DELETE FROM users WHERE userid = $1`
      await pool.query(sql, [userid]);
      console.log('Delete User Success');
      res.redirect('/users');
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Error Deleting Data User" })
    }
  })

  router.get('/datatable', async (req, res) => {
    let params = []

    if (req.query.search.value) {
      params.push(`email ilike '%${req.query.search.value}%'`)
    }
    if (req.query.search.value) {
      params.push(`name ilike '%${req.query.search.value}%'`)
    }
    if (req.query.search.value) {
      params.push(`role ilike '%${req.query.search.value}%'`)
    }
    const limit = req.query.length
    const offset = req.query.start
    const sortBy = req.query.columns[req.query.order[0].column].data
    const sortMode = req.query.order[0].dir

    const total = await pool.query(`select count(*) as total from users${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
    const data = await pool.query(`select * from users${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)

    const response = {
      "draw": Number(req.query.draw),
      "recordsTotal": total.rows[0].total,
      "recordsFiltered": total.rows[0].total,
      "data": data.rows
    }
    res.json(response)
  })


  return router;
}