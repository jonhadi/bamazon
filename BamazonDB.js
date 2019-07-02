var mysql = require("mysql");
var inquirer = require("inquirer");
var notLoggedIn = true;
  
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
  startScreen();
});

function startScreen() {
  inquirer
  .prompt([
    {
      type: "list",
      message: "Are you a current user or new user?",
      choices: ["CURRENT USER", "NEW USER", "EXIT PROGRAM"],
      name: "screen",
    }
  ])
  .then(function(screenRes){
    if (screenRes.screen === "CURRENT USER") {
      logIn();
    } else if (screenRes.screen === "NEW USER") {
      createAccount();
    } else {
      connection.end();
    }
  })
}

function createAccount() {
  inquirer
  .prompt([
    {
      type: "input",
      message: "enter your username: ",
      name: "username"
    },
    {
      type: "password",
      message: "enter your password: ",
      name: "password",
      mask: "*"
    },
    {
      type: "password",
      message: "re-enter your password: ",
      name: "passwordCheck",
      mask: "*"
    },
  ])
  .then(function(newUser){
    connection.query("SELECT * FROM users", function(err, res) {
      if (err) throw err;
      for (var i = 0; i < res.length; i++) {
        if (newUser.username === res[i].username) {
        console.log("that username is not avaliable");
        createAccount();
        }
      }
      if (newUser.password === newUser.passwordCheck) {
        var query = connection.query("INSERT INTO users SET ?",
        {
          username: newUser.username,
          password: newUser.password
        }, function(err) {
          if (err) throw err;
          console.log("new user created \n");
          //console.log(query.sql);
          logIn();
        });
      } else {
        console.log("passwords do not match");
        createAccount();
      }
    });
  })
}

function logIn() {
  console.log("LOG IN")
  inquirer
  .prompt([
    {
      type: "input",
      message: "username: ",
      name: "username"
    },
    {
      type: "password",
      message: "password: ",
      name: "password",
      mask: "*"
    },
  ])
  .then(function(accountRes) {
    var promise = new Promise(function(resolve, reject) {
      resolve(logCheck(accountRes.username, accountRes.password));
    });
    promise.then(function() {
      if (notLoggedIn) {
        console.log("Incorrect Username or Password");
        logIn();
      }
    });
  }) 
}

function logCheck(username, password) {
  connection.query("SELECT * FROM users", function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      if (username === res[i].username) { 
        if (password === res[i].password) {
          console.log("Successfully logged in");
          notLoggedIn = false;
          AskItemPrompts(username);
        } 
      } 
    } 
  });
}
  
function AskItemPrompts(user) {
    inquirer
    .prompt([
        {
          type: "list",
          message: "What would you like to do?",
          choices: ["POST AN ITEM", "BID ON AN ITEM", "EXIT PROGRAM"],
          name: "option"
        },
    ])
    .then(function(inquirerResponse) {
        if (inquirerResponse.option === "POST AN ITEM") {
          PostingItem(user);
        } else if (inquirerResponse.option === "BID ON AN ITEM") {
          BiddingItem(user);
        }
        else {
           connection.end();
        }
    });
  }

function PostingItem(user) {
  inquirer
  .prompt([
      {
      type: "input",
      message: "Enter the name of your item:",
      name: "itemName"
      },
      {
      type: "number",
      message: "Enter the price (starting bid) of your item ($):",
      name: "itemPrice"
      },
  ])
  .then(function(postingResponse) {
      console.log("Inserting a new product...\n");
      var query = connection.query(
        "INSERT INTO items SET ?",
        {
          name: postingResponse.itemName,
          seller: user,
          current_bid: postingResponse.itemPrice,
          current_bidder: user,
          time_posted: new Date()
        },
        function(err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " product inserted!\n");
          AskItemPrompts(user);
        }
      );
      // logs the actual query being run
      console.log(query.sql);
  });
}

function BiddingItem(user) {
  console.log("Selecting all items...\n");
  connection.query("SELECT * FROM items", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    //console.log(res);
    var itemidArray = [];
    for (let i = 0; i < res.length; i++) {
      itemidArray.push(res[i].id + ": " + res[i].name + " - $" + res[i].current_bid);
    }
    inquirer
    .prompt([
      {
        type: "list",
        message: "Which item would you like to bid on?",
        choices: itemidArray,
        name: "choice"
      },
    ])
    .then(function(choiceResponse) {
      var idCoice = choiceResponse.choice.substr(0, choiceResponse.choice.indexOf(':'));
      var choice = "SELECT * FROM items WHERE id=" + idCoice;
      console.log(choice);
      connection.query(choice, function(err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.log("item name: " + res[0].name);
        console.log("current bid: $" + res[0].current_bid);
        inquirer
        .prompt([
          {
          type: "input",
          message: "Input your bid: ",
          name: "newBid",
          },
        ])
        .then(function(bidderRes) {       
          if (bidderRes.newBid > res[0].current_bid) {
            connection.query("UPDATE items SET ?,? WHERE ?",
            [
              {
                current_bid: bidderRes.newBid
              },
              {
                current_bidder: user
              },
              {
                id: idCoice
              }
            ],
            function(err, res) {
              if (err) throw err;
              console.log("Bid updated!\n");
              AskItemPrompts(user);
            }
            );
          } else {
            console.log("Your bid is lower than the current bid!");
            AskItemPrompts(user);
}})})});});}
