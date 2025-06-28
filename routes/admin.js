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
    try {
        const genresWithCount = await global.banco.getGendersWithMovieCount();
    
        res.render('admin/genres', {
            admNome: global.adminName,
            genresWithCount: genresWithCount
        });
    } catch (error) {
        console.error(error);
    }
});

/* GET newgender */
router.get('/newgender', verifyLogin, async function(req, res) {
    res.render('admin/newgender');
});

/* GET delete gender */
router.get('/deletegender/:id', async function(req, res) {
    const genderid = req.params.id;

    try {
        // Verifica se existem filmes associados
        const moviesAmount = await global.banco.getAmountOfMoviesByGender(genderid);

        if (moviesAmount > 0) {
            return res.redirect('/admin/genres');
        }

        // Exclui o gênero
        await global.banco.deleteGender(genderid);
        return res.redirect('/admin/genres');
    } catch (error) {
        console.error("Erro ao excluir gênero:", error);
        return res.redirect('/admin/genres');
    }
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

/* POST newgender */
router.post('/newgender', async function(req, res) {
    const gendername = req.body.name;

    const gender = await global.banco.verifyGenderExistenceByName(gendername);

    // Se o gênero ainda não existir
    if (gender == false) {
        try {
            await global.banco.insertNewGender(gendername);
            res.redirect('/admin/genres');
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro interno ao inserir novo gênero.');
        }
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