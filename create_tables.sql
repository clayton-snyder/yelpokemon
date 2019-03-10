CREATE TABLE IF NOT EXISTS pokemon
(
	id				INTEGER	PRIMARY KEY,
    name			VARCHAR(20) NOT NULL UNIQUE,
    typePrimary		TEXT NOT NULL,
    typeSecondary	TEXT,
    flavorText		TEXT
);

CREATE TABLE IF NOT EXISTS review
(
    id              INTEGER PRIMARY KEY AUTO_INCREMENT,
    pokemonPK       INTEGER NOT NULL,
    stars           INTEGER NOT NULL,
    reviewText      TEXT
);
