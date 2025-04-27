SET client_encoding=LATIN9;
-- Exported from MS Access to PostgreSQL
-- (C) 1997-98 CYNERGI - www.cynergi.net, info@cynergi.net

/*Kas õnnestub täita kõik laused või jäävad kõik täitmata*/
START TRANSACTION;

CREATE TABLE Hotell (
hotelli_nr SERIAL,
nimi VARCHAR(50) NOT NULL,
linn VARCHAR(50) NOT NULL,
CONSTRAINT pk_hotell PRIMARY KEY (hotelli_nr),
CONSTRAINT ak_hotell_nimi UNIQUE (nimi));

CREATE TABLE Kylaline (
kylalise_nr SERIAL,
eesnimi  VARCHAR(50) NOT NULL,
perenimi  VARCHAR(50),
aadress  VARCHAR(255),
CONSTRAINT pk_kylaline PRIMARY KEY (kylalise_nr));

CREATE TABLE Kylaline_varu (
kylalise_nr INTEGER NOT NULL,
nimi VARCHAR(150),
aadress VARCHAR(255),
kylastuste_arv INTEGER, 
CONSTRAINT pk_kylaline_varu PRIMARY KEY (kylalise_nr),
CONSTRAINT chk_kylaline_varu_kylastuste_arv CHECK (kylastuste_arv>=0));

CREATE TABLE Reserveerimine (
hotelli_nr INTEGER NOT NULL,
ruumi_nr  INTEGER NOT NULL,
kylalise_nr INTEGER NOT NULL,
alguse_aeg DATE NOT NULL,
lopu_aeg  DATE,
on_aktuaalne BOOLEAN NOT NULL DEFAULT TRUE,
kommentaar TEXT,
CONSTRAINT pk_reserveerimine PRIMARY KEY (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg));

CREATE TABLE Reserveerimine_koopia (
hotelli_nr INTEGER,
ruumi_nr  INTEGER,
kylalise_nr INTEGER,
alguse_aeg DATE,
lopu_aeg  DATE,
on_aktuaalne BOOLEAN,
kommentaar TEXT);

CREATE TABLE Ruum (
ruumi_nr INTEGER NOT NULL,
hotelli_nr INTEGER NOT NULL,
ruumi_tyyp VARCHAR(50) NOT NULL,
hind DECIMAL(10,2) NOT NULL DEFAULT 50,
CONSTRAINT pk_ruum PRIMARY KEY (ruumi_nr, hotelli_nr),
CONSTRAINT chk_ruum_hind CHECK (hind>0));

CREATE TABLE Ruum_koopia (
ruumi_nr  INTEGER NOT NULL,
hotelli_nr INTEGER NOT NULL,
ruumi_tyyp VARCHAR(50) NOT NULL,
hind DECIMAL(10,2) NOT NULL DEFAULT 50, 
PRIMARY KEY (ruumi_nr, hotelli_nr),
CONSTRAINT chk_ruum_koopia_hind CHECK (hind>0));

ALTER TABLE Ruum_koopia ADD CONSTRAINT fk_Ruum_koopia_hotelli_nr FOREIGN KEY (hotelli_nr) REFERENCES Hotell(hotelli_nr) ON UPDATE CASCADE ON DELETE CASCADE;
CREATE INDEX idx_Ruum_koopia_hotelli_nr ON Ruum_koopia(hotelli_nr);
ALTER TABLE Ruum ADD CONSTRAINT fk_Ruum_hotelli_nr FOREIGN KEY (hotelli_nr) REFERENCES Hotell(hotelli_nr) ON UPDATE CASCADE ON DELETE CASCADE;
CREATE INDEX idx_Ruum_hotelli_nr ON Ruum(hotelli_nr);
ALTER TABLE Reserveerimine ADD CONSTRAINT fk_Reserveerimine_kylalise_nr FOREIGN KEY (kylalise_nr) REFERENCES Kylaline(kylalise_nr) ON UPDATE CASCADE;
CREATE INDEX idx_Reserveerimine_kylalise_nr ON Reserveerimine(kylalise_nr);
ALTER TABLE Reserveerimine ADD CONSTRAINT fk_Reserveerimine_ruumi_nr FOREIGN KEY (ruumi_nr, hotelli_nr) REFERENCES Ruum(ruumi_nr, hotelli_nr) ON UPDATE CASCADE;
CREATE INDEX idx_Reserveerimine_ruumi_nr ON Reserveerimine(ruumi_nr, hotelli_nr);


INSERT INTO Hotell (hotelli_nr, nimi, linn) VALUES (1, 'Viru', 'Tallinn');
INSERT INTO Hotell (hotelli_nr, nimi, linn) VALUES (2, 'Olümpia', 'Tallinn');
INSERT INTO Hotell (hotelli_nr, nimi, linn) VALUES (3, 'Palace', 'Tartu');
INSERT INTO Hotell (hotelli_nr, nimi, linn) VALUES (8, 'Radisson', 'Tallinn');

/*Järgmine generaatori väljastatav väärtus on 9*/
SELECT setval('hotell_hotelli_nr_seq', 8);

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     0, 
     1, 
     'Luksusnumber', 
     500 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     1, 
     1, 
     'Äriklassi tuba', 
     110.5 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     1, 
     2, 
     'Luksusnumber', 
     210 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     1, 
     3, 
     'Luksusnumber', 
     538.5 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     2, 
     1, 
     'Äriklassi tuba', 
     110.5 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     2, 
     2, 
     'Luksusnumber', 
     262 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     2, 
     3, 
     'Luksusnumber', 
     502.3 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     3, 
     1, 
     'Äriklassi tuba', 
     121.75 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     3, 
     2, 
     'Luksusnumber', 
     283 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     3, 
     3, 
     'Luksusnumber', 
     502 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     4, 
     1, 
     'Äriklassi tuba', 
     132 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     4, 
     2, 
     'Äriklassi tuba', 
     157 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     4, 
     3, 
     'Luksusnumber', 
     466.5 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     5, 
     1, 
     'Äriklassi tuba', 
     99.25 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     5, 
     2, 
     'Äriklassi tuba', 
     126 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     6, 
     1, 
     'Äriklassi tuba', 
     100 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     6, 
     2, 
     'Luksusnumber', 
     150 );

INSERT INTO Kylaline (kylalise_nr, eesnimi, perenimi, aadress)
VALUES (
     1, 
     'Aare', 
     'Vooster', 
     'Tallinn, Tihase 2' );

INSERT INTO Kylaline (kylalise_nr, eesnimi, perenimi, aadress)
VALUES (
     2, 
     'Ants', 
     'Tali', 
     'Tartu, Räni 2' );

INSERT INTO Kylaline (kylalise_nr, eesnimi, perenimi, aadress)
VALUES (
     3, 
     'Eric', 
     'Swensson', 
     NULL );

INSERT INTO Kylaline (kylalise_nr, eesnimi, perenimi, aadress)
VALUES (
     4, 
     'Thomas', 
     'Shark', 
     NULL );

INSERT INTO Kylaline (kylalise_nr, eesnimi, perenimi, aadress)
VALUES (
     5, 
     'Kati', 
     'Karu', 
     NULL );

INSERT INTO Kylaline (kylalise_nr, eesnimi, perenimi, aadress)
VALUES (
     6, 
     'Teet', 
     'Tee', 
     'Tallinn, Sipelga 15-5' );

INSERT INTO Kylaline (kylalise_nr, eesnimi, perenimi, aadress)
VALUES (
     7, 
     'Johhn', 
     'Smith', 
     NULL );

INSERT INTO Kylaline (kylalise_nr, eesnimi, perenimi, aadress)
VALUES (
     9, 
     'Eric', 
     'Smith', 
     NULL );

INSERT INTO Kylaline (kylalise_nr, eesnimi, perenimi, aadress)
VALUES (
     10, 
     'Toomas', 
     NULL, 
     NULL );

/*Järgmine generaatori väljastatav väärtus on 11*/
SELECT setval('kylaline_kylalise_nr_seq', 10);

INSERT INTO Kylaline_varu (kylalise_nr, nimi, aadress, kylastuste_arv)
VALUES (
     7, 
     'Johhn Smith', 
     NULL, 
     NULL );

INSERT INTO Kylaline_varu (kylalise_nr, nimi, aadress, kylastuste_arv)
VALUES (
     9, 
     'Eric Smith', 
     NULL, 
     NULL );

INSERT INTO Kylaline_varu (kylalise_nr, nimi, aadress, kylastuste_arv)
VALUES (
     10, 
     'Toomas', 
     NULL, 
     NULL );     
     
INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     0, 
     3, 
     '2011-03-12', 
     '2011-03-13', 
     TRUE,
     'Soovib rahu ja vaikust' );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     0, 
     9, 
     '2011-03-08', 
     '2011-03-12', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     0, 
     9, 
     '2012-03-09', 
     '2012-03-11', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     1, 
     1, 
     '2013-03-14', 
     '2013-03-15', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     2, 
     1, 
     '2009-03-01', 
     '2009-03-28', 
     FALSE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     2, 
     1, 
     '2015-03-07', 
     NULL, 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     2, 
     2, 
     '2013-01-01', 
     '2013-01-05', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     2, 
     2, 
     '2014-03-25', 
     NULL, 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     2, 
     3, 
     '2013-03-21', 
     '2013-03-22', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     2, 
     3, 
     '2014-03-18', 
     '2014-03-19', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     4, 
     1, 
     '2010-02-18', 
     '2010-02-23', 
     FALSE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     4, 
     2, 
     '2004-03-27', 
     '2004-05-01', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     4, 
     2, 
     '2012-01-06', 
     '2012-02-10', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     4, 
     4, 
     '2005-02-18', 
     '2005-04-21', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     4, 
     4, 
     '2009-03-10', 
     '2009-04-12', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     4, 
     7, 
     '2017-01-13', 
     NULL, 
     FALSE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     5, 
     1, 
     '2015-01-07', 
     '2015-01-09', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     5, 
     2, 
     '2017-01-28', 
     '2017-01-29', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     5, 
     7, 
     '2011-03-12', 
     '2011-03-20', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     1, 
     1, 
     '2011-03-08', 
     '2011-03-14', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     1, 
     2, 
     '2003-03-01', 
     '2003-03-03', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     1, 
     3, 
     '2004-03-09', 
     '2004-03-11', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     1, 
     3, 
     '2006-08-01', 
     '2006-08-05', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     1, 
     '2013-03-16', 
     '2013-03-17', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     2, 
     '2011-03-08', 
     '2011-03-11', 
     TRUE,
     'Tahab rahu ja vaikust' );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     2, 
     '2013-03-14', 
     '2013-03-16', 
     TRUE,
     'Palun rahu!' );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     2, 
     '2013-03-24', 
     '2013-04-06', 
     TRUE,
     'Mitte segada' );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     2, 
     '2014-03-15', 
     '2014-04-16', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     3, 
     '2015-03-12', 
     '2015-03-14', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     3, 
     '2016-03-12', 
     NULL, 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     3, 
     '2017-01-30', 
     '2017-02-01', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     4, 
     '2014-01-01', 
     '2014-01-21', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     3, 
     2, 
     '2003-02-01', 
     '2003-02-02', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     3, 
     6, 
     '2015-03-11', 
     '2015-03-13', 
     FALSE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     3, 
     7, 
     '2003-12-22', 
     '2003-12-28', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     4, 
     7, 
     '2002-08-18', 
     '2002-08-21', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     4, 
     7, 
     '2004-03-10', 
     '2004-03-15', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     4, 
     7, 
     '2012-02-09', 
     '2012-02-15', 
     FALSE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     5, 
     1, 
     '2011-03-08', 
     '2011-03-09', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     1, 
     1, 
     '2013-03-14', 
     '2013-03-15', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     1, 
     1, 
     '2013-03-18', 
     '2013-03-21', 
     FALSE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     1, 
     3, 
     '2014-03-23', 
     '2014-05-14', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     2, 
     1, 
     '2009-01-03', 
     NULL, 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     2, 
     1, 
     '2017-01-04', 
     '2017-01-07', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     2, 
     3, 
     '2010-03-01', 
     '2010-03-02', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     2, 
     6, 
     '2012-01-16', 
     '2012-02-10', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     2, 
     7, 
     '2012-03-15', 
     '2012-03-16', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     2, 
     9, 
     '2002-05-11', 
     '2002-05-22', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     3, 
     1, 
     '2013-12-15', 
     '2014-01-14', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     3, 
     1, 
     '2014-03-05', 
     '2014-03-07', 
     FALSE,
     'Tühistas!' );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     3, 
     9, 
     '2010-02-23', 
     '2010-03-01', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     4, 
     2, 
     '2005-02-18', 
     '2005-02-25', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     4, 
     2, 
     '2011-03-17', 
     '2011-03-19', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     4, 
     5, 
     '2015-03-09', 
     '2015-03-11', 
     FALSE,
     'Tühistas!' );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     4, 
     6, 
     '2003-03-10', 
     '2003-03-15', 
     TRUE,
     NULL );
     
     
INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     4, 
     2, 
     '2003-12-15', 
     '2004-01-12', 
     TRUE,
     NULL );
     

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     0, 
     3, 
     '2011-03-12', 
     '2011-03-13', 
     TRUE,
     'Soovib rahu ja vaikust' );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     0, 
     9, 
     '2011-03-08', 
     '2011-03-12', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     0, 
     9, 
     '2012-03-09', 
     '2012-03-11', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     1, 
     1, 
     '2013-03-14', 
     '2013-03-15', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     2, 
     1, 
     '2009-03-01', 
     '2009-03-28', 
     FALSE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     2, 
     1, 
     '2015-03-07', 
     NULL, 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     2, 
     2, 
     '2013-01-01', 
     '2013-01-05', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     2, 
     2, 
     '2014-03-25', 
     NULL, 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     2, 
     3, 
     '2013-03-21', 
     '2013-03-22', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     2, 
     3, 
     '2014-03-18', 
     '2014-03-19', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     4, 
     1, 
     '2010-02-18', 
     '2010-02-23', 
     FALSE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     4, 
     2, 
     '2004-03-27', 
     '2004-05-01', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     4, 
     2, 
     '2012-01-06', 
     '2012-02-10', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     4, 
     4, 
     '2005-02-18', 
     '2005-04-21', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     4, 
     4, 
     '2009-03-10', 
     '2009-04-12', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     5, 
     1, 
     '2015-01-07', 
     '2015-01-09', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     1, 
     5, 
     7, 
     '2011-03-12', 
     '2011-03-20', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     1, 
     1, 
     '2011-03-08', 
     '2011-03-14', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     1, 
     2, 
     '2003-03-01', 
     '2003-03-03', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     1, 
     3, 
     '2004-03-09', 
     '2004-03-11', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     1, 
     3, 
     '2006-08-01', 
     '2006-08-05', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     1, 
     '2013-03-16', 
     '2013-03-17', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     2, 
     '2011-03-08', 
     '2011-03-11', 
     TRUE,
     'Tahab rahu ja vaikust' );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     2, 
     '2013-03-14', 
     '2013-03-16', 
     TRUE,
     'Palun rahu!' );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     2, 
     '2013-03-24', 
     '2013-04-06', 
     TRUE,
     'Mitte segada' );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     2, 
     '2014-03-15', 
     '2014-04-16', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     3, 
     '2015-03-12', 
     '2015-03-14', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     2, 
     4, 
     '2014-01-01', 
     '2014-01-21', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     3, 
     2, 
     '2003-02-01', 
     '2003-02-02', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     3, 
     6, 
     '2015-03-11', 
     '2015-03-13', 
     FALSE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     3, 
     7, 
     '2003-12-22', 
     '2003-12-28', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     4, 
     7, 
     '2002-08-18', 
     '2002-08-21', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     4, 
     7, 
     '2004-03-10', 
     '2004-03-15', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     4, 
     7, 
     '2012-02-09', 
     '2012-02-15', 
     FALSE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     2, 
     5, 
     1, 
     '2011-03-08', 
     '2011-03-09', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     1, 
     1, 
     '2013-03-14', 
     '2013-03-15', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     1, 
     1, 
     '2013-03-18', 
     '2013-03-21', 
     FALSE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     1, 
     3, 
     '2014-03-23', 
     '2014-05-14', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     2, 
     1, 
     '2009-01-03', 
     NULL, 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     2, 
     3, 
     '2010-03-01', 
     '2010-03-02', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     2, 
     6, 
     '2012-01-16', 
     '2012-02-10', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     2, 
     7, 
     '2012-03-15', 
     '2012-03-16', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     2, 
     9, 
     '2002-05-11', 
     '2002-05-22', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     3, 
     1, 
     '2013-12-15', 
     '2014-01-14', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     3, 
     1, 
     '2014-03-05', 
     '2014-03-07', 
     FALSE,
     'Tühistas!' );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     3, 
     9, 
     '2010-02-23', 
     '2010-03-01', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     4, 
     2, 
     '2005-02-18', 
     '2005-02-25', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     4, 
     2, 
     '2011-03-17', 
     '2011-03-19', 
     TRUE,
     NULL );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     4, 
     5, 
     '2015-03-09', 
     '2015-03-11', 
     FALSE,
     'Tühistas!' );

INSERT INTO Reserveerimine_koopia (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     3, 
     4, 
     6, 
     '2003-03-10', 
     '2003-03-15', 
     TRUE,
     NULL );
 
SELECT * INTO Kylaline_koopia
FROM Kylaline
WHERE kylalise_nr<4;

UPDATE Kylaline_koopia SET aadress='Tallinn, Soo 12-2', eesnimi='Eerik' 
WHERE kylalise_nr=3;

INSERT INTO Kylaline_koopia (kylalise_nr, eesnimi, perenimi)
VALUES (100, 'Mari', 'Maasikas');

UPDATE Kylaline SET perenimi=NULL WHERE kylalise_nr=6;

INSERT INTO Hotell (hotelli_nr, nimi, linn)
VALUES (9, 'Telegraaf', 'Tallinn');

INSERT INTO Hotell (hotelli_nr, nimi, linn)
VALUES (10, 'Viljandi Paadimees', 'Viljandi');

/*Järgmine generaatori väljastatav väärtus on 11*/
SELECT setval('hotell_hotelli_nr_seq', 10);

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     1, 
     9, 
     'Luksusnumber', 
     500 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     2, 
     9, 
     'Luksusnumber', 
     555 );

INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     3, 
     9, 
     'Äriklassi tuba', 
     505 );
	 
INSERT INTO Ruum (ruumi_nr, hotelli_nr, ruumi_tyyp, hind)
VALUES (
     4, 
     9, 
     'Luksusnumber', 
     495 );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     9, 
     1, 
     5, 
     '2021-03-12', 
     '2021-03-13', 
     TRUE,
     'Soovib rahu ja vaikust' );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     9, 
     1, 
     6, 
     '2022-03-12', 
     '2022-03-13', 
     TRUE,
     'Soovib rahu ja vaikust' );
	 
INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     9, 
     3, 
     6, 
     '2022-04-12', 
     '2022-04-13', 
     TRUE,
     'Soovib rahu ja vaikust' );
	 
INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     9, 
     3, 
     6, 
     '2023-12-31', 
     '2024-01-02',
     TRUE,
     'Soovib rahu ja vaikust' );
	 
INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     9, 
     4, 
     5, 
     '2025-01-02', 
     '2025-01-05',
     TRUE,
     'Soovib rahu ja vaikust' );
	 
INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     9, 
     4, 
     5, 
     '2025-01-22', 
     '2025-01-23',
     TRUE,
     'Soovib rahu ja vaikust' );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     9, 
     4, 
     5, 
     '2025-02-02', 
     '2025-02-07',
     TRUE,
     'Ei soovi rahu ja vaikust' );

INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     9, 
     4, 
     9, 
     '2012-02-02', 
     '2012-02-07',
     TRUE,
     'Ei soovi rahu ja vaikust' );
	 
INSERT INTO Reserveerimine (hotelli_nr, ruumi_nr, kylalise_nr, alguse_aeg, lopu_aeg, on_aktuaalne, kommentaar)
VALUES (
     9, 
     4, 
     9, 
     '2012-02-12', 
     '2012-02-17',
     TRUE,
     'Soovib siiski rahu ja vaikust' );
	 
COMMIT;


