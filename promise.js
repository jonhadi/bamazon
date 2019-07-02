connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  // afterConnection();
  var promise = new Promise(function(resolve, reject) {
    resolve(selectVanilla());
  });
  promise.then(function() {
    selectChocolate();
  }).then(function(){
    selectStrawberry();
  }).then(function(){
    MoreThanThree();
  }).then(function(){
    connection.end();
  });
  
});

/* function afterConnection() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log(res);
    connection.end();
  });
} */


function selectVanilla(){
  connection.query("SELECT * FROM products WHERE flavor = 'vanilla'", function(err, res){
    if(err) throw err;
    console.log(res);
  });
}
function selectChocolate(){
  connection.query("SELECT * FROM products WHERE flavor = 'chocolate'", function(err, res){
    if(err) throw err;
    console.log(res);
  });
}
function selectStrawberry(){
  connection.query("SELECT * FROM products WHERE flavor = 'strawberry'", function(err, res){
    if(err) throw err;
    console.log(res);
  });
}

function MoreThanThree(){
  connection.query("SELECT * FROM products WHERE price > 3", function(err, res){
    if(err) throw err;
    console.log(res);
  });
}