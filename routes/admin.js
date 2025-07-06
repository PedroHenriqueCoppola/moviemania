const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// ======================
// CONFIGURAÇÕES 
// ======================

// Configuração de armazenamento
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads'); // pasta onde as imagens serão salvas
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // ex: 1625468791234.jpg
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb) {
        // Permitir apenas arquivos jpg
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
            cb(null, true);
        } else {
            cb(new Error('Somente arquivos JPG são permitidos.'), false);
        }
    }
});

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

/* GET updategender */
router.get('/updategender/:id', verifyLogin, async function(req, res) {
    const genderid = req.params.id;
    const gender = await global.banco.getGenderById(genderid);

    if (gender && genderid) {
        res.render('admin/updategender', {
            genderId: genderid,
            genderName: gender.gendername
        });
    }
});

/* GET movies */
router.get('/movies', verifyLogin, async function(req, res) {
    try {
        const movies = await global.banco.searchMovies();

        res.render('admin/movies', {
            movies: movies
        });
    } catch (error) {
        console.error(error);
    }
});

/* GET newmovie */
router.get('/newmovie', verifyLogin, async function(req, res) {
    const genres = await global.banco.searchGenres();

    res.render('admin/newmovie', {
        allGenres: genres
    });
});

/* GET delete movie */
router.get('/deletemovie/:id', async function(req, res) {
    const movieid = req.params.id;

    try {
        // Exclui o filme
        await global.banco.deleteMovie(movieid);
        return res.redirect('/admin/movies');
    } catch (error) {
        console.error("Erro ao excluir filme:", error);
        return res.redirect('/admin/movies');
    }
});

/* GET users */
router.get('/users', verifyLogin, async function(req, res) {
    const usersWithProfileCount = await global.banco.getUsersWithProfileCount();

    try {
        res.render('admin/users', {
            admNome: global.adminName,
            usersWithProfileCount: usersWithProfileCount
        });
    } catch (error) {
        console.error(error);
    }
});

/* GET newuser */
router.get('/newuser', verifyLogin, async function(req, res) {
    res.render('admin/newuser');
});

/* GET delete user */
router.get('/deleteuser/:id', async function(req, res) {
    const userid = req.params.id;
    const profilesAmount = await global.banco.getAmountOfProfilesByUser(userid);

    try {
        if (profilesAmount > 0) {
            await global.banco.deleteProfiles(userid)
        }

        await global.banco.deleteUser(userid);
        return res.redirect('/admin/users');
    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        return res.redirect('/admin/users');
    }
});

/* GET updateuser */
router.get('/updateuser/:id', verifyLogin, async function(req, res) {
    const userid = req.params.id;
    let userName = '';
    let userEmail = '';
    let fgAdmin = 0;
    let profilesList = [];
    let profilesAmount = 0;

    try {
        const userDetails = await global.banco.searchUserById(userid); 
        if (!userDetails) {
            return res.status(404).send('Usuário não encontrado.');
        }
        userName = userDetails.username;
        userEmail = userDetails.useremail;
        fgAdmin = userDetails.fgadmin;

        const userInfoResults = await global.banco.getUserAndProfileInfo(userid);
        
        if (userInfoResults && userInfoResults.length > 0 && userInfoResults[0].profileid !== null) {
            profilesList = userInfoResults.map(row => ({
                profileid: row.profileid,
                profilename: row.profilename
            }));
            profilesAmount = profilesList.length;
        }

        res.render('admin/updateuser', {
            userId: userid,
            userName: userName,
            userEmail: userEmail,
            userInfo: profilesList,
            fgAdmin: fgAdmin,
            profilesAmount: profilesAmount
        });
    } catch (error) {
        console.error("Erro ao buscar informações para o formulário de edição: ", error);
    }
});

/* GET statistics */
router.get('/statistics', verifyLogin, async function(req, res) {
    const ratings = await global.banco.getBestRatings();

    try {
        res.render('admin/statistics', {
            ratings: ratings
        });
    } catch (error) {
        console.error(error);
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

/* POST updategender */
router.post('/updategender', async function(req, res) {
    const genderid = req.body.genderid;
    const gendername = req.body.name;

    const gender = await global.banco.verifyGenderExistenceByName(gendername);

    if (gendername != "" && gender == false) {
        try {
            await global.banco.updateGender(gendername, genderid);
            res.redirect('/admin/genres');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro interno ao atualizar gênero.');
        }
    } else {
        console.error("Insira um gênero válido e não existente");
    }
});

/* POST newmovie */
router.post('/newmovie', upload.single('image'), async function(req, res) {
    try {
        const { title, desc, gender, date, duration } = req.body;
        const image = req.file;

        if (!image) {
            return res.status(400).send('Imagem é obrigatória.');
        }

        // Validação do formato da duração
        const durationRegex = /^\d{2}:\d{2}:\d{2}$/;
        if (!durationRegex.test(duration)) {
            return res.status(400).send('Formato de duração inválido. Use HH:MM:SS.');
        }

        const [hours, minutes, seconds] = duration.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || minutes > 59 || seconds > 59) {
            return res.status(400).send('Duração inválida.');
        }

        const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

        // Inserts
        const movieId = await global.banco.insertNewMovie(title, desc, totalSeconds, date, '/uploads/' + image.filename);
        await global.banco.insertMovieGenre(movieId, parseInt(gender));

        res.redirect('/admin/movies');
    } catch (error) {
        console.error('Erro ao adicionar novo filme:', error);
    }
});

/* POST newuser */
router.post('/newuser', async function(req, res) {
    const username = req.body.name;
    const useremail = req.body.email;
    const password = req.body.password;
    const userphone = req.body.phone;
    let permission = req.body.admin;

    const user = await global.banco.searchUserByEmail(useremail);

    if (user == null) {
        try {
            // Verificação da permissão de admin do usuário (0 = user, 1 = admin)
            permission = (permission === "no") ? 0 : 1;

            await global.banco.insertUserByAdminPage(username, useremail, password, userphone, permission);
            res.redirect('/admin/users');
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro interno ao inserir novo usuário.');
        }
    }
});

/* POST updateuser */
router.post('/updateuser', verifyLogin, async function(req, res) {
    const { userid, name, profilename, profileid } = req.body;

    const receivedProfileNames = Array.isArray(profilename) ? profilename : (profilename ? [profilename] : []);
    const receivedProfileIds = Array.isArray(profileid) ? profileid : (profileid ? [profileid] : []);

    let profilesToProcess = [];

    // Pega os perfis existentes
    for (let i = 0; i < receivedProfileNames.length; i++) {
        if (receivedProfileIds[i] && receivedProfileNames[i] && receivedProfileNames[i].trim() !== '') {
            profilesToProcess.push({
                profileid: parseInt(receivedProfileIds[i]),
                profilename: receivedProfileNames[i]
            });
        }
    }

    try {
        await global.banco.updateExistingUserAndProfiles(parseInt(userid), name, profilesToProcess);

        res.redirect('/admin/users');
    } catch (error) {
        console.error('Erro ao processar atualização do usuário e perfis:', error.message);
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