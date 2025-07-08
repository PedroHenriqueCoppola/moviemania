const mysql = require('mysql2/promise');

async function connDB() {
    if (global.conexao && global.conexao.state !== 'disconnected') {
        return global.conexao;
    }

    const connection = mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'moviemania'
    });

    global.conexao = connection;
    return global.conexao;
}

// ===========================
// INSERT - QUERIES 
// ===========================

async function insertUserInformations(email, name, password, phone) {
    const conn = await connDB();
    
    // Este comando SQL tenta inserir um novo usuário
    // Se ele encontrar um e-mail duplicado (por causa da chave UNIQUE),
    // ele executa a parte do ON DUPLICATE KEY UPDATE, atualizando os dados existentes.
    const sql = `
        INSERT INTO users (useremail, username, userpassword, userphone, fgadmin) 
        VALUES (?, ?, ?, ?, false)
        ON DUPLICATE KEY UPDATE 
            username=VALUES(username), 
            userpassword=VALUES(userpassword), 
            userphone=VALUES(userphone);
    `;
    
    await conn.query(sql, [email, name, password, phone]);

    // Busca o usuário para ter certeza que está com os dados mais recentes para retornar
    const user = await searchUserByEmail(email);
    return user;
}

async function insertProfiles(profilename, userid) {
    const conn = await connDB();
    const sql = 'INSERT INTO profiles (profilename, id_user) VALUES (?, ?);';
    await conn.query(sql, [profilename, userid]);
}

async function insertNewGender(gendername) {
    const conn = await connDB();
    const sql = 'INSERT INTO genres (gendername) VALUES (?);';
    await conn.query(sql, [gendername]);
}

async function insertUserByAdminPage(name, email, password, phone, fgadmin) {
    const conn = await connDB();
    const sql = 'INSERT INTO users (username, useremail, userpassword, userphone, fgadmin) VALUES (?, ?, ?, ?, ?);';
    await conn.query(sql, [name, email, password, phone, fgadmin]);
}

async function insertNewMovie(title, desc, durationInSeconds, releaseDate, imagePath) {
    const conn = await connDB();
    const sql = `
        INSERT INTO movies (movietitle, moviedesc, movietime, dtrelease, movieimage)
        VALUES (?, ?, ?, ?, ?);
    `;
    const [result] = await conn.query(sql, [title, desc, durationInSeconds, releaseDate, imagePath]);
    return result.insertId;
}

async function insertMovieGenre(movieId, genderId) {
    const conn = await connDB();
    const sql = `
        INSERT INTO movie_gender (id_movie, id_gender)
        VALUES (?, ?);
    `;
    await conn.query(sql, [movieId, genderId]);
}

// ===========================
// DELETE - QUERIES 
// ===========================

async function deleteGender(genderid) {
    const conn = await connDB();
    const sql = "DELETE FROM genres WHERE genderid=?";
    await conn.query(sql, [genderid]);
}

async function deleteMovie(movieid) {
    const conn = await connDB();

    try {
        // Apagar avaliações
        const sqlDeleteRatings = "DELETE FROM ratings WHERE id_movie = ?";
        await conn.query(sqlDeleteRatings, [movieid]);

        // Apagar relações com gêneros
        const sqlDeleteMovieGender = "DELETE FROM movie_gender WHERE id_movie = ?";
        await conn.query(sqlDeleteMovieGender, [movieid]);

        // Apagar relações com listas
        const sqlDeleteMovielist = "DELETE FROM movielist WHERE id_movie = ?";
        await conn.query(sqlDeleteMovielist, [movieid]);

        // PApagar o filme
        const sqlDeleteMovie = "DELETE FROM movies WHERE movieid = ?";
        await conn.query(sqlDeleteMovie, [movieid]);
    } catch (error) {
        console.error(`Erro ao deletar o filme ${movieid}:`, error);
        throw error;
    }
}

async function deleteUser(userid) {
    const conn = await connDB();
    const sql = "DELETE FROM users WHERE userid=?";
    await conn.query(sql, [userid]);
}

async function deleteProfiles(userid) {
    const conn = await connDB();
    const sql = "DELETE FROM profiles WHERE id_user=?";
    await conn.query(sql, [userid]);
}

// ===========================
// UPDATE - QUERIES 
// ===========================

async function updateGender(gendername, genderid) {
    const conn = await connDB();
    const sql = "UPDATE genres SET gendername=? WHERE genderid=?;";
    await conn.query(sql, [gendername, genderid]);
}

async function updateExistingUserAndProfiles(userId, newUserName, profilesToUpdate) {
    try {
        let conn = await connDB();

        // Atualizar usuário
        const userUpdateSql = `
            UPDATE users
            SET username = ?
            WHERE userid = ?;
        `;
        await conn.query(userUpdateSql, [newUserName, userId]);

        // Atualizar perfis
        if (profilesToUpdate && profilesToUpdate.length > 0) {
            for (const profile of profilesToUpdate) {
                const profileUpdateSql = `
                    UPDATE profiles
                    SET profilename = ?
                    WHERE profileid = ? AND id_user = ?;
                `;
                await conn.query(profileUpdateSql, [profile.profilename, profile.profileid, userId]);
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário e perfis:', error);
        throw error;
    }
}

async function updateMovie(movieid, title, desc, durationInSeconds, releaseDate, imagePath) {
    const conn = await connDB();
    let sql, params;

    if (imagePath) {
        sql = `
            UPDATE movies
            SET movietitle = ?, moviedesc = ?, movietime = ?, dtrelease = ?, movieimage = ?
            WHERE movieid = ?;
        `;
        params = [title, desc, durationInSeconds, releaseDate, imagePath, movieid];
    } else {
        sql = `
            UPDATE movies
            SET movietitle = ?, moviedesc = ?, movietime = ?, dtrelease = ?
            WHERE movieid = ?;
        `;
        params = [title, desc, durationInSeconds, releaseDate, movieid];
    }

    await conn.query(sql, params);
}

async function updateMovieGender(movieid, newGenderId) {
    const conn = await connDB();
    const sql = `
        UPDATE movie_gender
        SET id_gender = ?
        WHERE id_movie = ?;
    `;
    await conn.query(sql, [newGenderId, movieid]);
}

// ===========================
// SELECT - QUERIES 
// ===========================

async function searchUsers() {
    const conn = await connDB();
    const sql = "SELECT * FROM users ORDER BY userid;";
    const [users] = await conn.query(sql);

    return users;
}

async function searchUserById(id) {
    const conn = await connDB();
    const sql = 'SELECT * FROM users WHERE userid=?;';
    const [result] = await conn.query(sql, [id]);

    // Retorna o usuário ou null
    return result.length > 0 ? result[0] : null; 
}

async function searchUserByEmail(email) {
    const conn = await connDB();
    const sql = 'SELECT * FROM users WHERE useremail=?;';
    const [result] = await conn.query(sql, [email]);

    // Retorna o usuário ou null
    return result.length > 0 ? result[0] : null;
}

async function verifyUserExistence(email, password) {
    const conn = await connDB();
    const sql = "SELECT * FROM users WHERE useremail=? AND userpassword=?;";
    const [result] = await conn.query(sql, [email, password]);

    // Retorna o usuário ou null
    return result.length > 0 ? result[0] : null;
}

async function searchGenres() {
    const conn = await connDB();
    const sql = "SELECT * FROM genres ORDER BY genderid;";
    const [genres] = await conn.query(sql);

    return genres;
}

async function getAmountOfMoviesByGender(genderid) {
    const conn = await connDB();
    const sql = "SELECT COUNT(*) AS total FROM movie_gender WHERE id_gender=?";
    const [result] = await conn.query(sql, [genderid]);

    return result[0].total;
}

async function getGendersWithMovieCount() {
    try {
        const genres = await searchGenres(); 

        const genresWithCount = await Promise.all(
            genres.map(async (gender) => {
                const amount = await getAmountOfMoviesByGender(gender.genderid);

                return {
                    genderId: gender.genderid,
                    genderName: gender.gendername,
                    moviesAmount: amount
                };
            })
        );
        
        return genresWithCount;
    } catch (error) {
        console.error("Erro ao buscar gêneros com contagem de filmes:", error);
    }
}

async function verifyGenderExistenceByName(name) {
    const conn = await connDB();
    const sql = "SELECT * FROM genres WHERE gendername=?;";
    const [result] = await conn.query(sql, [name]);

    // Retorna o gênero (se existe) ou false (se não existe)
    return result.length > 0 ? result[0] : false;
}

async function getGenderById(genderid) {
    const conn = await connDB();
    const sql = "SELECT * FROM genres WHERE genderid=?;";
    const [result] = await conn.query(sql, [genderid]);

    // Retorna o gênero (se existe) ou false (se não existe)
    return result.length > 0 ? result[0] : false;
}

async function searchMovies() {
    const conn = await connDB();
    const sql = `
        SELECT
            m.movieid,
            m.movietitle,
            g.gendername
        FROM
            movies AS m
        LEFT JOIN movie_gender AS mg 
            ON m.movieid = mg.id_movie
        LEFT JOIN genres AS g 
            ON mg.id_gender = g.genderid
        GROUP BY
            m.movieid
        ORDER BY
            m.movieid;
    `;
    const [movies] = await conn.query(sql);

    return movies;
}

async function searchMovieById(movieid) {
    const conn = await connDB();
    const sql = `
        SELECT 
            m.movieid,
            m.movietitle,
            m.moviedesc,
            m.movietime,
            m.dtrelease,
            m.movieimage,
            mg.id_gender
        FROM 
            movies m
        INNER JOIN movie_gender mg 
            ON m.movieid = mg.id_movie
        WHERE 
            m.movieid = ?
    `;
    const [results] = await conn.query(sql, [movieid]);
    
    return results.length > 0 ? results[0] : null;
}

async function getAmountOfProfilesByUser(userid) {
    const conn = await connDB();
    const sql = "SELECT COUNT(*) AS total FROM profiles WHERE id_user=?";
    const [result] = await conn.query(sql, [userid]);

    return result[0].total;
}

async function getUsersWithProfileCount() {
    try {
        const users = await searchUsers(); 

        const usersWithProfileCount = await Promise.all(
            users.map(async (user) => {
                const amount = await getAmountOfProfilesByUser(user.userid);

                return {
                    userId: user.userid,
                    userName: user.username,
                    userEmail: user.useremail,
                    profilesAmount: amount,
                    permission: user.fgadmin
                };
            })
        );

        return usersWithProfileCount;
    } catch (error) {
        console.error("Erro ao buscar usuários com contagem de perfis:", error);
    }
}

async function getUserAndProfileInfo(userid) {
    const conn = await connDB();
    const sql = `
        SELECT 
            u.userid,
            u.username,
            u.useremail,
            u.fgadmin,
            p.profileid,
            p.profilename
        FROM 
            users u
        LEFT JOIN profiles p 
            ON u.userid = p.id_user
        WHERE 
            u.userid=?
    `;
    const [results] = await conn.query(sql, [userid]);
    return results;
}

async function getBestRatings() {
    const conn = await connDB();
    const sql = `
            SELECT
                r.ratingid,
                r.id_user,
                r.id_movie,
                r.ratingscore,
                r.ratingcomment,
                m.movietitle
            FROM
                ratings r
            INNER JOIN movies m 
                ON r.id_movie = m.movieid
            ORDER BY
                r.ratingscore DESC
            LIMIT 5;
        `;
    const [result] = await conn.query(sql);

    return result.length > 0 ? result : false;
}

async function searchProfileInfoById(profileId) {
    const conn = await connDB();
    const sql = 'SELECT * FROM profiles WHERE profileid = ?';
    const [result] = await conn.query(sql, [profileId]);

    return result.length > 0 ? result[0] : false;
}

async function getMoviesByGenre(genderId) {
    const conn = await connDB();
    const sql = `
        SELECT 
            m.movieid,
            m.movietitle,
            m.movieimage
        FROM
            movies m
        INNER JOIN movie_gender mg
            ON m.movieid = mg.id_movie
        WHERE
            mg.id_gender = ?
    `;
    const [movies] = await conn.query(sql, [genderId]);
    return movies;
}

async function getWatchLaterMoviesByUser(userId) {
    const conn = await connDB();
    const sql = `
        SELECT
            m.movieid,
            m.movietitle,
            m.movieimage
        FROM
            movielist ml
        INNER JOIN lists l
            ON ml.id_list = l.listid
        INNER JOIN movies m
            ON ml.id_movie = m.movieid
        WHERE
            l.id_user = ?
            AND ml.towatchmovielist = 1
    `;
    const [movies] = await conn.query(sql, [userId]);
    return movies;
}

async function getGenresWithMovies() {
    const genres = await searchGenres();

    const genresWithMovies = [];
    for (const genre of genres) {
        const movies = await getMoviesByGenre(genre.genderid);
        if (movies.length > 0) {
            genresWithMovies.push({
                genreName: genre.gendername,
                movies: movies
            });
        }
    }
    return genresWithMovies;
}

module.exports = {
    insertUserInformations,
    insertProfiles,
    insertNewGender,
    insertUserByAdminPage,
    insertNewMovie,
    insertMovieGenre,
    deleteGender,
    deleteMovie,
    deleteUser,
    deleteProfiles,
    updateGender,
    updateExistingUserAndProfiles,
    updateMovie,
    updateMovieGender,
    searchUsers,
    searchUserById,
    searchUserByEmail,
    verifyUserExistence,
    searchGenres,
    getAmountOfMoviesByGender,
    getGendersWithMovieCount,
    verifyGenderExistenceByName,
    getGenderById,
    searchMovies,
    searchMovieById,
    getAmountOfProfilesByUser,
    getUsersWithProfileCount,
    getUserAndProfileInfo,
    getBestRatings,
    searchProfileInfoById,
    getMoviesByGenre,
    getWatchLaterMoviesByUser,
    getGenresWithMovies
}