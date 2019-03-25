var MongoClient = require('mongodb');
const CONNECTION_STRING = process.env.DB;
var fetch = require('node-fetch');

function StockHandler() {
  
  this.getPrice = async function(stock, callback) {
    var price;
    var url ='https://api.iextrading.com/1.0/stock/'+stock+'/price';
    let response = await fetch(url);
    price = await response.json()
      .then((price)=> {console.log(price); callback (null, 'price', price, stock);})
      .catch ((err)=> callback(err, null, null, null));   
  };
  
  this.getLikes = function(stock, like, ip, callback) {
    var likes;
    if (like) {
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.collection('stocks').findAndModify({stock:stock}, [], {$addToSet:{likes:ip}}, {new:true, upsert:true}, (err, data)=>{
          if (err) {callback(err, null, null, null);}
          likes= data.value.likes.length;
          callback(null, 'like', likes, stock);
        });
      });  
    } else {
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.collection('stocks').find({stock:stock}).toArray((err, arr) => {
          if(err) {
           callback(err, null, null, null); 
          }
          if (arr.length > 0){
            likes = arr[0].likes.length;
          }
          callback(null, 'like', likes, stock);
        });
      });
    }    
  };  
}

module.exports = StockHandler;
