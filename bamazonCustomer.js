var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  showProducts();
});

var showProducts= function() {
  connection.query("SELECT * FROM products", function(err, res) {
    for (var i=0; i < res.length; i++) {
      console.log("Item Number: " + res[i].id + 
            "\n Product: " + res[i].product_name + 
            " || Department: " + res[i].department_name +
            "\n Price: " + res[i].price +
            " || Amount in stock: " + res[i].stock_quantity + "\n")
    }
    askQuestions(res);
  });
};

var askQuestions = function(res) {
  inquirer.prompt([{
    type: "input",
    name: "name",
    message: "Which products would you like to purchase?"
  }]).then(function(answer){
    var correct = false;
    for (var i=0; i<res.length; i++) {
      if (res[i].product_name=== answer.name){
        correct = true;
        var product = answer.name;
        var id=i;
inquirer.prompt({
          type: "input",
          name: "quant",
          message: "How many?",
          validate: function(value) {
            if(isNaN(value) == false){
              return true;
            } else {
              return false;
            }
          }
          }).then(function(answer){
            if ((res[id].stock_quantity- answer.quant)>0){
              connection.query("UPDATE products SET stock_quantity='"
                +(res[id].stock_quantity- answer.quant)
                + "' WHERE product_name='"+ product
                + "'", function(err,res2) {
                  console.log("Thank you for your purchase. \n Here is the updated list\n");
                  showProducts();
                })
            } else {
              console.log("Sorry. Not enough in stock.")
              askQuestions(res);
            };
          })
        }
      }
      if (i==res.length && correct===false) {
        console.log("Sorry, we dont have that item.")
        askQuestions(res);
      }
    });
  };
