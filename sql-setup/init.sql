
ALTER USER 'production'@'%' IDENTIFIED WITH mysql_native_password BY 'production';

FLUSH PRIVILEGES;


CREATE TABLE IF NOT EXISTS target (
    id VARCHAR(255) PRIMARY KEY,
    last_followers_page INT,
    last_friends_page INT,
    followers_next_cursor VARCHAR(255),
    friends_next_cursor VARCHAR(255)
)  ENGINE=INNODB;


CREATE TABLE IF NOT EXISTS affinity (
    id VARCHAR(255) PRIMARY KEY,
    follows INT,
    followed_by INT
)  ENGINE=INNODB;
