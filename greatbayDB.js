var mysql = require("mysql");
var inquirer = require("inquirer");
var moment = require("moment");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "qwQW12!@",
  database: "greatbayDB"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  createProduct();
});

inquirer
.prompt([
    {
    type: "list",
    message: "What would you like to do?",
    choices: ["POST AN ITEM", "BID ON AN ITEM"],
    name: "option"
    },
])
.then(function(inquirerResponse) {
    if (inquirerResponse.option === "POST AN ITEM") {
        PostingItem();
    }
    else {
        BiddingItem();
    }
});
  

function PostingItem() {
    inquirer
    .prompt([
        {
        type: "input",
        message: "Enter the name of your item:",
        name: "item-name"
        },
        {
        type: "input",
        message: "Enter your name: ",
        name: "item-seller"
        }, 
        {
        type: "number",
        message: "Enter the price (starting bid) of your item ($):",
        name: "item-price"
        },
    ])
    .then(function(postingResponse) {
        newListing(postingResponse);
    });
}

function newListing(response) {
    console.log("Inserting a new product...\n");
    var query = connection.query(
      "INSERT INTO items SET ?",
      {
        name: response.item-name,
        seller: response.item-seller,
        current_bid: response.item-price,
        current_bidder: response.item-seller,
        time_posted: 'now()',
      },
      function(err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " product inserted!\n");
        // Call updateProduct AFTER the INSERT completes
        updateProduct();
      }
    );
  // logs the actual query being run
  console.log(query.sql);
}

function updateBidder() {
  console.log("Updating all Rocky Road quantities...\n");
  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        quantity: 100
      },
      {
        flavor: "Rocky Road"
      }
    ],
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " products updated!\n");
      // Call deleteProduct AFTER the UPDATE completes
      deleteProduct();
    }
  );

  // logs the actual query being run
  console.log(query.sql);
}

function removeListing() {
  console.log("Deleting all strawberry icecream...\n");
  connection.query(
    "DELETE FROM products WHERE ?",
    {
      flavor: "strawberry"
    },
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " products deleted!\n");
      // Call readProducts AFTER the DELETE completes
      readProducts();
    }
  );
}

function readListing() {
  console.log("Selecting all products...\n");
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.log(res);
    connection.end();
  });
}
