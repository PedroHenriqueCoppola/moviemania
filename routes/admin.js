const express = require('express');
const router = express.Router();

// GET login admin
router.get('/', function(req, res) {
    res.render('admin/login', { title: 'MovieMania - Admin' });
});

router.get('/genres', async function(req, res) {
    verifyLogin(res);

    const genres = await global.banco.searchGenres();

    const genresWithCount = await Promise.all(
        genres.map(async (gender) => {
            const amount = await global.banco.getAmountOfMoviesByGender(gender.genderid);

            return {
                genderId: gender.genderid,
                genderName: gender.gendername,
                moviesAmount: amount
            };
        })
    );

    res.render('admin/genres', {
        // admNome: global.admNome,
        genresWithCount
    });
});

// POST login admin
router.post('/loginadmin', async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const admin = await global.banco.verifyUserExistence(email, password);

    if (admin.userid && admin.fgadmin == 1) {
        global.userid = admin.userid;
        global.useremail = admin.useremail;

        res.redirect('/admin/genres');
    } else {
        res.redirect('/admin');
    }
});

// Funções de segurança

// Verifica o usuário está logado
function verifyLogin(res) {
    if (!global.useremail || global.useremail == "") {
        res.redirect('/admin');
    }
}

module.exports = router;