var express = require('express');
var router = express.Router();

// GET
/* GET home */
router.get('/', function(req, res, next) {
    res.render('index', {title: "MovieMania"});
});

/* GET perfis */
router.get('/users', async function(req, res, next) {
    // garante o acesso a usuarios registrados
    // verificarLogin(res);

    // carregar os perfis relacionados ao usuario logado
    // const registroPerfis = await global.banco.buscarPerfis(global.usucodigo);

    // carrega a pagina de perfis para a escolha do perfil que vai assistir
    res.render('users', {title : 'Escolha um perfil'});
});

/* GET email logon */
router.get('/emaillogon', function(req, res, next) {
    res.render('emaillogon', {title: "MovieMania"});
});

/* GET password logon */
router.get('/passwordlogon', function(req, res, next) {
    res.render('passwordlogon', {title: "MovieMania"});
});

/* GET users logon */
router.get('/userslogon', function(req, res, next) {
    res.render('userslogon', {title: "MovieMania"});
});


// POST
/* POST: login => users page */
router.post('/login', async function(req, res, next){
    const email = req.body.email;
    const senha = req.body.senha;

    // const usuario = await global.banco.buscarUsuario({email,senha});

    // se foi retornado um usuario do banco
    // if (usuario.usucodigo) {
        // cria um registro de seção de uso utilizando o objeto GLOBAL
        // global.usucodigo = usuario.usucodigo;
        // global.usuemail = usuario.usuemail;
        // redireciona o usuario para a rota GET /perfis
        res.redirect('/users');
    // } else {
    //   res.redirect('/');
    // }
});

/* POST: email logon => password logon */
router.post('/emaillogon', async function(req, res, next){
    res.redirect('/passwordlogon');
});

/* POST: password logon => users logon */
router.post('/passwordlogon', async function(req, res, next){
    res.redirect('/userslogon');
});

/* POST: users logon => users page */
router.post('/userslogon', async function(req, res, next){
    res.redirect('/users');
});

module.exports = router;
