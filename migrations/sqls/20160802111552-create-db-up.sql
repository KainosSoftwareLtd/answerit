CREATE TABLE answer(
                id SERIAL PRIMARY KEY,
                text TEXT not null );

CREATE TABLE question(
                id SERIAL PRIMARY KEY,
                text TEXT not null );

CREATE TABLE tag(
                id SERIAL PRIMARY KEY,
                tag VARCHAR(40) not null  );

CREATE TABLE bid(
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) not null,
                date TIMESTAMP without time zone default (now() at time zone 'utc') );

CREATE TABLE question_bid_link(
                id SERIAL PRIMARY KEY,
                question_id integer references question(id) ON DELETE CASCADE,
                bid_id integer references bid(id) ON DELETE CASCADE );

CREATE TABLE question_tag_link(
                id SERIAL PRIMARY KEY,
                tag_id integer references tag(id) ON DELETE CASCADE,
                bid_id integer references bid(id) ON DELETE CASCADE );

CREATE TABLE question_answer_link(
                id SERIAL PRIMARY KEY,
                question_id integer references tag(id) ON DELETE CASCADE,
                answer_id integer references bid(id) ON DELETE CASCADE );
