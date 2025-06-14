const express = require('express');
const router = express.Router();

// =================
// ROTAS GET 
// =================

/* GET home */
router.get('/', function(req, res) {
    if (global.isAdminLoggedIn) {
        return res.redirect('/admin/genres');
    }
    res.render('admin/login', { title: 'MovieMania - Admin' });
});

/* GET genres */
router.get('/genres', verifyLogin, async function(req, res) {
    // Verificação na função de get. Só roda se o admin estiver logado

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
        admNome: global.adminName,
        genresWithCount
    });
});

// rota a ser criada: logout do admin
// router.get('/logout', function(req, res){
//     global.isAdminLoggedIn = false;
//     global.adminName = null;
//     res.redirect('/admin');
// });

// =================
// ROTAS POST 
// =================

/* POST login admin */
router.post('/loginadmin', async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const admin = await global.banco.verifyUserExistence(email, password);

    if (admin && admin.fgadmin == 1) {
        // Cria uma flag global pra verificação do login
        global.isAdminLoggedIn = true;
        global.adminName = admin.username;

        res.redirect('/admin/genres');
    } else {
        res.redirect('/admin');
    }
});

// =========================================
// FUNÇÕES DE SEGURANÇA (MIDDLEWARE)
// =========================================

// Verifica o usuário está logado de acordo com a flag global
function verifyLogin(req, res, next) {
    if (global.isAdminLoggedIn) {
        next();
    } else {
        res.redirect('/admin');
    }
}

module.exports = router;