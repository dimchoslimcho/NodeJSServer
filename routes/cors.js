const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];

var corsOptionsDelegate = (req, callback) => {
  var corsOptions;

  if(whitelist.indexOf(req.header('Origin')) !== -1)   //if the incoming req header contains a origin filed then we are going to check this whitelist, is it present in this whitelist
  {
    corsOptions = {origin:true}; //allow to be accepted, it is ok for the server to accept this request for this particular origin
  }
  else {
    corsOptions = {origin:false};
  }
  callback(null, corsOptions);
};

exports.cors = cors();  // this is with wildecard *
exports.corsWithOptions = cors(corsOptionsDelegate);
