CREATE DATABASE moviemania;

USE moviemania;

CREATE TABLE users (
    userid INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    useremail VARCHAR(255) UNIQUE NOT NULL,
    userpassword VARCHAR(255) NOT NULL,
    userphone varchar(20) NOT NULL,
    fgadmin BOOLEAN DEFAULT 0,
    dtcreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
    profileid INT AUTO_INCREMENT PRIMARY KEY,
    profilename VARCHAR(255) NOT NULL,
    id_user INT,
    profileimage VARCHAR(255) NOT NULL,
    dtcreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(userid)
);

CREATE TABLE genres (
    genderid INT AUTO_INCREMENT PRIMARY KEY,
    gendername VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE movies (
    movieid INT AUTO_INCREMENT PRIMARY KEY,
    movietitle VARCHAR(255) NOT NULL,
    moviedesc TEXT,
    moviedirector VARCHAR(255),
    movietime INT,
    dtrelease DATE,
    movieimage VARCHAR(255) 
);

CREATE TABLE movie_gender (
    moviegenderid INT AUTO_INCREMENT PRIMARY KEY,
    id_movie INT,
    id_gender INT,
    FOREIGN KEY (id_movie) REFERENCES movies(movieid),
    FOREIGN KEY (id_gender) REFERENCES genres(genderid)
);

CREATE TABLE lists (
    listid INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    FOREIGN KEY (id_user) REFERENCES users(userid)
);

CREATE TABLE movielist (
    movielistid INT AUTO_INCREMENT PRIMARY KEY,
    id_list INT,
    id_movie INT,
    watchedmovielist BOOLEAN NOT NULL DEFAULT 0,
    towatchmovielist BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (id_list) REFERENCES lists(listid),
    FOREIGN KEY (id_movie) REFERENCES movies(movieid)
);

CREATE TABLE ratings (
    ratingid INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    id_movie INT,
    ratingscore DECIMAL(2,1),
    ratingcomment TEXT,
    FOREIGN KEY (id_user) REFERENCES users(userid),
    FOREIGN KEY (id_movie) REFERENCES movies(movieid)
);