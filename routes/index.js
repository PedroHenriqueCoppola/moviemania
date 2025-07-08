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
router.get('/users', verifyLogin, async function(req, res, next) {
    try {
        const userId = global.loggedInUserId;
        const userAndProfiles = await global.banco.getUserAndProfileInfo(userId);

        if (userAndProfiles.length > 0) {
            const userName = userAndProfiles[0].username;

            // Cria um array com os perfis
            const profiles = userAndProfiles
                .filter(profile => profile.profileid !== null)
                .map(profile => ({
                    id: profile.profileid,
                    name: profile.profilename
                }));

            res.render('users', {
                userName: userName,
                profiles: profiles
            });
        } else {
            res.render('users', {
                userName: "Usuário",
                profiles: []
            });
        }
    } catch (error) {
        console.error('Erro ao carregar perfis:', error);
        res.status(500).send('Erro ao carregar perfis.');
    }
});

/* GET home com perfil selecionado */
router.get('/home/:profileid', verifyLogin, async function(req, res, next) {
    const profileId = req.params.profileid;

    try {
        const selectedProfile = await global.banco.searchProfileInfoById(profileId);

        if (selectedProfile) {
            global.activeProfileId = selectedProfile.profileid;
            global.activeProfileName = selectedProfile.profilename;

            // Filmes por gênero
            const genresWithMovies = await global.banco.getGenresWithMovies();

            // Filmes "Assistir mais tarde"
            const watchLaterMovies = await global.banco.getWatchLaterMoviesByUser(global.loggedInUserId);

            res.render('home', {
                profileId: selectedProfile.profileid,
                profileName: selectedProfile.profilename,
                genresWithMovies: genresWithMovies,
                watchLaterMovies: watchLaterMovies
            });
        } else {
            res.redirect('/users');
        }
    } catch (err) {
        res.status(500).send('Erro ao carregar o perfil.');
    }
});

router.get('/moviedetails/:movieid', verifyLogin, async function(req, res, next) {
    const movieId = req.params.movieid;

    try {
        const movie = await global.banco.searchMovieById(movieId);
        const ratings = await global.banco.getRatingsByMovieId(movieId);
        const averageRating = await global.banco.getAverageRatingByMovieId(movieId);

        const hours = String(Math.floor(movie.movietime / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((movie.movietime % 3600) / 60)).padStart(2, '0');
        const seconds = String(movie.movietime % 60).padStart(2, '0');
        const duration = `${hours}:${minutes}:${seconds}`;

        if (movie) {
            res.render('moviedetails', {
                movie: movie,
                ratings: ratings,
                movieDuration: duration,
                averageRating: averageRating
            });
        } else {
            res.status(404).send('Filme não encontrado.');
        }
    } catch (err) {
        res.status(500).send('Erro ao carregar o filme.');
    }
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
    const userphone = req.body.phone;

    if (username && userpassword && userphone) {
        try {
            const newUser = await global.banco.insertUserInformations(useremail, username, userpassword, userphone);

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

router.post('/moviedetails/:movieid', verifyLogin, async function(req, res) {
    const movieId = req.params.movieid;
    const userId = global.loggedInUserId;

    const { score, comment } = req.body;

    try {
        const hasRated = await global.banco.checkIfUserHasRated(userId, movieId);

        if (hasRated) {
            return res.redirect('/moviedetails/' + movieId);
        }

        if (score < 0 || score > 5) {
            return res.redirect('/moviedetails/' + movieId);
        }

        if (score != "" && comment != "") {
            await global.banco.insertMovieRating(userId, movieId, score, comment);
        }
        res.redirect('/moviedetails/' + movieId);
    } catch (err) {
        res.status(500).send("Erro ao salvar a avaliação.");
    }
});

// ========================
// FUNÇÕES DE SEGURANÇA
// ========================

// Verifica o usuário está logado
function verifyLogin(req, res, next) {
    if (global.loggedInUserId) {
        next();
    } else {
        res.redirect('/');
    }
}

module.exports = router;
