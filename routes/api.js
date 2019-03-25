/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';


var MongoClient = require('mongodb');
var StockHandler = require('../controllers/stockHandler.js');
const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  var stockInfo = new StockHandler();
  app.enable('trust proxy');
  app.route('/api/stock-prices')
    .get(function (req, res){
      var stock = req.query.stock;
      var like = req.query.like ? true : false;
      var stockData = {};
      var likes = {
        first: null,
        second:null
      };
      var ip = req.ip;
      console.log(ip, stock);
    if (Array.isArray(stock)) {
      console.log('array');
      stockData = [
        {
        stock:stock[0].toUpperCase(),
        price:null,
        rel_likes:null
        },
        {
        stock:stock[1].toUpperCase(),
        price:null,
        rel_likes:null
        }
      ];
      console.log(stockData);
      for (var i=0; i<stock.length; i++) {
        console.log('process', stock[i]);
        stockInfo.getPrice(stock[i], output);
        stockInfo.getLikes(stock[i], like, ip, output);
      }
    } else {
      stockData = {
        stock:stock.toUpperCase(),
        price:null,
        likes:null
        };
      stockInfo.getPrice(stock, output);
      stockInfo.getLikes(stock, like, ip, output);
    }
    function output (err, name, value, stockName) {
     // console.log(name, value, stockName)
      if (err) {
        res.send(err);
      } else {
      if (Array.isArray(stock)) {
        if (name === 'price') {
          if (stockName === stock[0]){
            stockData[0].price = value;
          } else {
            stockData[1].price = value;
          }          
        }
        if (name === 'like') {
          if (stockName === stock[0]){
            likes.first = value;
          } else {
            likes.second = value;
          }    
        }
        if ((likes.first!==null)&&(likes.second!==null)) {
          stockData[0].rel_likes = likes.first - likes.second;
          stockData[1].rel_likes = likes.second - likes.first;
          console.log(stockData);
          res.json({stockData});
        }
      } else {
        if (name === 'price') {
          stockData.price = value;
        }
        if (name === 'like') {
          stockData.likes = value;
        }
        if ((stockData.price!==null)&&(stockData.likes!==null)) {
          res.json({stockData});
        }
      }
      }
    }
    });    
};
