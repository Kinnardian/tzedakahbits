--Postgres Stuff

CREATE TABLE causes (

cause_id bigserial NOT NULL PRIMARY KEY,
cause_name varchar(40) NOT NULL,
goal integer,
sponsor varchar(30),
organization varchar(30),
submitter varchar(30),
address varchar(34),
balance numeric

);