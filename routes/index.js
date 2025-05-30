var express = require('express');
var router = express.Router();

const banco = require('../banco');
global.banco = banco;

// GET
/* GET home */
router.get('/', function(req, res, next) {
    res.render('index', {title: "MovieMania"});
});

/* GET email logon */
router.get('/emaillogon', function(req, res, next) {
    res.render('emaillogon', {title: "MovieMania"});
});

/* GET password logon */
router.get('/passwordlogon', function(req, res, next) {
    const email = req.query.email;
    global.useremail = email;

    res.render('passwordlogon', {title: "MovieMania", email: email});
});

/* GET users logon */
router.get('/userslogon', function(req, res, next) {
    const userid = req.query.id;
    global.userid = userid;

    res.render('userslogon', {title: "MovieMania"});
});

/* GET perfis */
router.get('/users', async function(req, res, next) {
    // garante o acesso a usuarios registrados
    verifyLogin(res);

    // carregar os perfis relacionados ao usuario logado
    // const registroPerfis = await global.banco.buscarPerfis(global.usucodigo); -- FALTA FAZER

    // Deleta os registros que ficaram em branco caso houve alguma falha durante o logon
    await global.banco.cleanEmptyEmails();

    // carrega a pagina de perfis para a escolha do perfil que vai assistir
    res.render('users', {title : 'Escolha um perfil'});
});


// POST
/* POST: login => users page */
router.post('/login', async function(req, res, next){
    const email = req.body.email;
    const password = req.body.password;

    const user = await global.banco.verifyUserExistence(email, password);

    // Se ele existe no banco
    if(user.userid && user.fgadmin == 0) {
        global.userid = user.userid;
        global.useremail = user.useremail;

        res.redirect('/users');
    } else {
        res.redirect('/');
    }
});

/* POST: email logon => password logon */ 
router.post('/emaillogon', async function(req, res, next){
    const email = req.body.newEmail;

    // verificação se o email já foi cadastrado no banco
    const userExists = await global.banco.searchUserByEmail(email);

    if(userExists && email != "") {
        try {
            await global.banco.insertNewEmail(email);
            res.redirect(`/passwordlogon?email=${encodeURIComponent(email)}`);
        } catch (err) {
            res.status(500).send('Erro interno');
        }
    }
});

/* POST: password logon => users logon */
router.post('/passwordlogon', async function(req, res, next){
    const useremail = global.useremail;
    const username = req.body.newUsername;
    const userpassword = req.body.newPassword;
    const userphone = req.body.newPhone;

    const user = await global.banco.searchUserByEmail(useremail);

    if (username && userpassword && userphone) {
        try {
            await global.banco.insertUserInformations(useremail, username, userpassword, userphone);
            res.redirect(`/userslogon?id=${encodeURIComponent(user.userid)}`);
        } catch (err) {
            res.status(500).send('Erro interno');
        }
    }
});

/* POST: users logon => users page */
router.post('/userslogon', async function(req, res, next){
    const userOne = req.body.newUserOne;
    const userTwo = req.body.newUserTwo ? req.body.newUserTwo : null;
    const userThree = req.body.newUserThree ? req.body.newUserThree : null;
    const userFour = req.body.newUserFour ? req.body.newUserFour : null;

    if (userOne && userTwo && userThree && userFour) {
        try {
            // Insere os perfis
            await global.banco.insertProfiles(userOne, global.userid);
            await global.banco.insertProfiles(userTwo, global.userid);
            await global.banco.insertProfiles(userThree, global.userid);
            await global.banco.insertProfiles(userFour, global.userid);
            
            // Deleta os registros que ficaram em branco no caso do usuário voltar e redigitar o email no processo
            await global.banco.cleanEmptyEmails();

            // Redireciona para a página de usuários
            res.redirect('/users');
        } catch (err) {
            res.status(500).send('Erro interno');
        }
    }
});

// Funções de segurança

// Verifica o usuário está logado
function verifyLogin(res) {
    if (!global.useremail || global.useremail == "") {
        res.redirect('/');
    }
}

module.exports = router;
