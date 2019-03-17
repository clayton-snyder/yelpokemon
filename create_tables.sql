CREATE TABLE `pokemon` (
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `typePrimary` text NOT NULL,
  `typeSecondary` text,
  `flavorText` text,
  `averageRating` decimal(3,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
);


CREATE TABLE IF NOT EXISTS `review` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pokemonName` varchar(20) NOT NULL,
  `stars` int(11) NOT NULL,
  `reviewText` text,
  `author` varchar(30) DEFAULT 'Anonymous',
  PRIMARY KEY (`id`)
);
