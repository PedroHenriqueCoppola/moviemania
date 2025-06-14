var express = require('express');
var router = express.Router();

const banco = require('../banco');
global.banco = banco;

// =================
// ROTAS GET 
// =================

/* GET home */
router.get('/', function(req, res, next) {
    res.render('index', {title: "MovieMania"});
});

/* GET email logon */
router.get('/emaillogon', function(req, res, next) {
    res.render('emaillogon', {title: "MovieMania"});
});

/* GET password logon */
router.get('/passwordlogon/:email', function(req, res, next) {
    // Captura o email da URL
    const email = req.params.email;
    
    res.render('passwordlogon', {title: "MovieMania", email: email});
});

/* GET users logon */
router.get('/userslogon/:id', async function(req, res, next) {
    try {
        // Captura o email da URL
        const userid = req.params.id;
        const user = await global.banco.searchUserById(userid);

        if (user) {
            res.render('userslogon', {
                title: "MovieMania", 
                userId: user.userid, 
                userEmail: user.useremail 
            });
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao carregar a página de perfis.");
    }
});

/* GET perfis */
router.get('/users', async function(req, res, next) {
    // garante o acesso a usuarios registrados
    if (!verifyLogin(res)) {
        return;
    }

    // carregar os perfis relacionados ao usuario logado
    // const registroPerfis = await global.banco.buscarPerfis(global.usucodigo); -- FALTA FAZER

    // carrega a pagina de perfis para a escolha do perfil que vai assistir
    res.render('users', {title : 'Escolha um perfil'});
});

// =================
// ROTAS POST 
// =================

/* POST: login => users page */
router.post('/login', async function(req, res, next){
    const email = req.body.email;
    const password = req.body.password;
    const user = await global.banco.verifyUserExistence(email, password);

    // Se ele existe no banco
    if(user && user.userid && user.fgadmin == 0) {
        global.loggedInUserId = user.userid; 
        res.redirect('/users');
    } else {
        res.redirect('/');
    }
});

/* POST: email logon => password logon */ 
router.post('/emaillogon', async function(req, res, next){
    const email = req.body.newEmail;
    const userExists = await global.banco.searchUserByEmail(email);

    // Prosseguir somente se o email não existir e não estiver vazio
    if (!userExists && email) {
        // Apenas redireciona. NÃO insere nada no banco ainda
        res.redirect(`/passwordlogon/${encodeURIComponent(email)}`);
    } else {
        res.redirect('/emaillogon?error=email_invalido');
    }
});

/* POST: password logon => users logon */
router.post('/passwordlogon/:email', async function(req, res, next){
    const useremail = req.params.email;
    const username = req.body.newUsername;
    const userpassword = req.body.newPassword;
    const userphone = req.body.newPhone;

    if (username && userpassword && userphone) {
        try {
            // INSERE O USUÁRIO COMPLETO DE UMA VEZ.
            const newUser = await global.banco.insertUserInformations(useremail, username, userpassword, userphone);

            // Verifica se o usuário e o id foram criados corretamente.
            if (newUser && newUser.userid) {
                res.redirect(`/userslogon/${newUser.userid}`);
            } else {
                throw new Error("Falha ao criar o usuário ou obter o ID de retorno.");
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro interno do servidor ao criar usuário.');
        }
    }
});

/* POST: users logon => users page */
router.post('/userslogon/:id', async function(req, res, next){
    const userId = req.params.id;
    const userOne = req.body.newUserOne;
    const userTwo = req.body.newUserTwo || null;
    const userThree = req.body.newUserThree || null;
    const userFour = req.body.newUserFour || null;

    if (userOne) {
        try {
            await global.banco.insertProfiles(userOne, userId);
            if(userTwo) await global.banco.insertProfiles(userTwo, userId);
            if(userThree) await global.banco.insertProfiles(userThree, userId);
            if(userFour) await global.banco.insertProfiles(userFour, userId);

            // Guarda o ID do usuário que acabou de se cadastrar
            global.loggedInUserId = userId;
            
            res.redirect('/users');
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro interno ao inserir perfis.');
        }
    }
});

// ========================
// FUNÇÕES DE SEGURANÇA
// ========================

// Verifica o usuário está logado
function verifyLogin(res) {
    if (!global.loggedInUserId) {
        res.redirect('/');
        return false;
    }
    return true;
}

module.exports = router;
