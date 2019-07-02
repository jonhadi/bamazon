DROP DATABASE IF EXISTS bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;

create table users (
  id INT NOT NULL AUTO_INCREMENT,
  username varchar(30),
  password varchar(30),
  PRIMARY KEY (id)
);

CREATE TABLE items (
  id INT NOT NULL AUTO_INCREMENT,
  name varchar(30),
  seller varchar(30),
  price float(10),
  stock float(10),
  department varchar(30),
  PRIMARY KEY (id)
);

INSERT INTO users (username, password) values ("admin", "pw123");
INSERT INTO users (username, password) values ("dude", "pw123");
INSERT INTO users (username, password) values ("george", "pw123");
INSERT INTO items (name, seller, price, stock, department)
VALUES ("Blueberry", "Emmons Farm", 0.25, 50000000, "groceries");
INSERT INTO items (name, seller, price, stock, department)
VALUES ("Computer", "NewEgg", 999, 500, "electronics");
INSERT INTO items (name, seller, price, stock, department)
VALUES ("Jon Snow Action Figure", "GoT", 60, 500000, "toys");
INSERT INTO items (name, seller, price, stock, department)
VALUES ("Charger", "Samsung", 10, 90000000, "electronics");
INSERT INTO items (name, seller, price, stock, department)
VALUES ("Charger", "Appple", 5000, 2, "electronics");
































































