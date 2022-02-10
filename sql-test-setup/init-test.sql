
ALTER USER 'development'@'%' IDENTIFIED WITH mysql_native_password BY 'development';

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

INSERT INTO target (id, last_followers_page, last_friends_page, followers_next_cursor, friends_next_cursor)
VALUES ('1', 15, 4, '123', '456');

INSERT INTO target (id, last_followers_page, last_friends_page, followers_next_cursor, friends_next_cursor)
VALUES ('4', 12, 15, '333', '444');
