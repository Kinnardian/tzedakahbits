//Postgres Stuff

CREATE TABLE causes (

cause_id bigint NOT NULL default nextval('causes_cause_id_seq'::regclass),
cause_name varchar(40) NOT NULL,
goal integer,
sponsor varchar(30),
organization varchar(30),
submitter varchar(30),
address varchar(34),
balance numeric

);