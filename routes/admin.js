const express = require('express');
const router = express.Router();

// GET login admin
router.get('/', function(req, res) {
    res.render('admin/login', { title: 'MovieMania - Admin' });
});

router.get('/dashboard', function(req, res) {
    res.render('admin/dashboard', { title: 'Dashboard - Admin' });
});

// POST login admin
router.post('/loginadmin', async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const admin = await global.banco.verifyUserExistence(email, password);

    if (admin.userid && admin.fgadmin == 1) {
        global.userid = admin.userid;
        global.useremail = admin.useremail;

        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/admin');
    }
});

module.exports = router;