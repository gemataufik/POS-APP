var express = require('express');
var router = express.Router();


module.exports = (pool) => {
  /* GET users listing. */
  router.get("/", function (req, res, next) {
   
    pool.query("select * from units", (err, data) => {
      if (err) {
        console.log(err);
      }
      res.render("units/index", {
        data: data.rows,
        user: req.session.user,
        error: req.flash("error"),
      });
    });
  });
  

  router.get("/add", (req, res) => {

    res.render("units/add", {
      data: {},
      renderFrom: "add",
      user: req.session.user,
      error: req.flash("error"),
    });
  });


  router.post("/add", (req, res) => {

    pool.query(
      "INSERT INTO units(unit, name, note) VALUES ($1, $2, $3)",
      [req.body.unit, req.body.name, req.body.note],
     function (err) {
        if (err) {
          console.log(err);
          req.flash("error", err.message);
          return res.redirect(`/units/add`);
        }
        res.redirect("/units");
      }
    );
  });


  router.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const stockAlert = req.session.stockAlert;
    pool.query("select * from units where unit = $1", [id], (err, item) => {
      if (err) {
        console.log(err);
      }
      res.render("units/edit", {
        data: item.rows[0],
        renderFrom: "edit",
        user: req.session.user,
        stockAlert,
        error: req.flash("error"),
      });
    });
  });


  router.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    pool.query(
      "UPDATE units SET unit = $1, name = $2, note = $3 where unit = $4",
      [req.body.unit, req.body.name, req.body.note, id],
      function (err) {
        if (err) {
          console.error(err);
          req.flash("error", err.message);
          res.redirect(`/units/edit/${id}`);
        } else {
          res.redirect("/units");
        }
      }
    );
  });


  router.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    pool.query("delete from units where unit = $1", [id], (err) => {
      if (err) {
        console.log("hapus data Units gagal");
        req.flash("error", err.message);
        return res.redirect(`/`);
      }
      res.redirect("/units");
    });
  });


  router.get('/datatable', async (req, res) => {
    let params = []

    if (req.query.search.value) {
      params.push(`unit ilike '%${req.query.search.value}%'`)
    }
    if(req.query.search.value){
        params.push(`name ILIKE '%${req.query.search.value}%'`)
    }
    if(req.query.search.value){
        params.push(`note ILIKE '%${req.query.search.value}%'`)
    }
    const limit = req.query.length
    const offset = req.query.start
    const sortBy = req.query.columns[req.query.order[0].column].data
    const sortMode = req.query.order[0].dir

    const total = await pool.query(`select count(*) as total from units ${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
    const data = await pool.query(`select * from units ${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)

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