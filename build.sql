--Postgres Stuff

CREATE TABLE causes (

cause_id bigserial NOT NULL PRIMARY KEY,
cause_name varchar(40) NOT NULL,
goal integer NOT NULL,
sponsor varchar(30),
organization varchar(30),
submitter varchar(30) NOT NULL,
address varchar(34) NOT NULL,
balance numeric NOT NULL DEFAULT 0
cause_description varchar(600) NOT NULL,
tagline varchar(24) NOT NULL

);
