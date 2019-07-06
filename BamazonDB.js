var mysql = require("mysql");
var inquirer = require("inquirer");
  
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "BamazonDB"
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
        connection.query("INSERT INTO users SET ?",
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
    logSync(accountRes.username, accountRes.password)
  }) 
}

async function logSync(username, password) {
  const notLoggedIn = await logCheck(username, password);
  //console.log(notLoggedIn);

  if(notLoggedIn === true) {
    console.log("Incorrect Username or Password");
    logIn();
  } else if(notLoggedIn === false) {
    console.log("Successfully logged in");
    AskItemPrompts(username);
  } else {
    //console.log("error");
    console.log("Successfully logged in");
    AskItemPrompts(username);
  }
}

function logCheck(username, password) {
  var sql = "SELECT * FROM users where username = ?"
  var sql = mysql.format(sql, username);
  var pass;
  connection.query(sql, (err, result) =>{ 
    console.log(result);
    if(result.password === password) {
      pass = false;
    } else {
      pass = true;
    }
  });
  return pass;
}
  
function AskItemPrompts(user) {
    inquirer
    .prompt([
        {
          type: "list",
          message: "What would you like to do?",
          choices: ["POST AN ITEM", "BUY ITEMS", "EXIT PROGRAM"],
          name: "option"
        },
    ])
    .then(function(inquirerResponse) {
        if (inquirerResponse.option === "POST AN ITEM") {
          postingItem(user);
        } else if (inquirerResponse.option === "BUY ITEMS") {
          buyItem(user);
        }
        else {
           connection.end();
        }
    });
  }

function postingItem(user) {
  inquirer
  .prompt([
      {
      type: "input",
      message: "Enter the name of your item:",
      name: "itemName"
      },
      {
      type: "list",
      message: "What kind of item is it?",
      choices: ["groceries", "electronics", "toys"],
      name: "department"
      },
      {
      type: "number",
      message: "Enter the price of your item ($):",
      name: "itemPrice"
      },
      {
      type: "number",
      message: "Enter How many items you're selling:",
      name: "itemStock"
      },
  ])
  .then(function(postingResponse) {
      console.log("Inserting a new product...\n");
      var query = connection.query(
        "INSERT INTO items SET ?",
        {
          name: postingResponse.itemName,
          seller: user,
          price: postingResponse.itemPrice,
          stock: postingResponse.itemStock,
          department: postingResponse.department
        },
        function(err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " product posted!\n");
          AskItemPrompts(user);
        }
      );
      // logs the actual query being run
      console.log(query.sql);
  });
}

function buyItem(user) {
  console.log("Selecting all items...\n");
  connection.query("SELECT * FROM items", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    //console.log(res);
    var itemidArray = [];
    for (let i = 0; i < res.length; i++) {
      itemidArray.push(res[i].id + ": " + res[i].name + " - $" + res[i].price + " - Stock: " + res[i].stock);
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
        console.log("Price: $" + res[0].price);
        console.log("stock: " + res[0].stock);
        inquirer
        .prompt([
          {
          type: "number",
          message: "How many are you buying? ",
          name: "productsOrdered",
          },
        ])
        .then(function(customer) {       
          if (customer.productsOrdered <= res[0].stock) {
            var total = customer.productsOrdered * res[0].price;
            inquirer
            .prompt([
              {
                type: "list",
                message: "Your total is: $ "+ total,
                choices: ["YES", "NO"],
                name: "confirmation"
              }
            ]).then(function(response) {
              if (response.confirmation === "YES") {
                var newStock = res[0].stock - customer.productsOrdered;
                connection.query("UPDATE items SET ? WHERE ?",
                [
                  {
                    stock: newStock,
                  },
                  {
                    id: res[0].id,
                  }
                ],
                function(err, res) {
                  if (err) throw err;
                  console.log("Stock updated!\n");
                  AskItemPrompts(user);
                });
              } else {
                buyItem(user);
              }
            })
            
          } else {
            console.log("There is not of that item avaliable");
            AskItemPrompts(user);
}})})});});}
