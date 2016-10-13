'use strict';

const http = require('http');

exports.handler = function(event,context,callback) {
  var endpoint = "foo.bar.com";  // Elasticsearch endpoint
  var indices_regex = /logstash/;  // Regex for indices you wish to remove
  var retention_period = 10;  // The amount of indices you wish to retain
  
  var es = `http://${endpoint}`;
  var indices_path = "/_stats/indices";
  var full_path = es + indices_path;
  var matched_array = [];

  http.get(full_path, function(res) {
    var response = ''; // Will contain the final response

    // Received data is a buffer.
    // Adding it to our body
    res.on('data', function(data){
      response += data;
    });

    // After the response is completed, parse it and log it to the console
    res.on('end', function() {
      var parsed = JSON.parse(response);
      var indices = Object.keys(parsed.indices);
      sortindices(indices);
    });
  });

  function sortindices(parsed){
    // Goes through each index that is returned and puts object into array that matches regex
    parsed.forEach(function(value){
      var match_result = value.search(indices_regex);
      if (match_result === 0) {
        matched_array.push(value);
      }
    });

    // Sorts the indices by date order
    var sorted = matched_array.sort(function(a, b){
      return Date.parse(a) - Date.parse(b);
    });
    
    // Define the retention policy and create array 
    // of all indices that match the regex provided
    var retention = sorted.slice(Math.max(sorted.length - retention_period, 0));

    // Removes compares the `retention` and `matched_array` to remove the duplicates 
    // and creates a new array that contains the indices we want to remove
    var indices_to_remove = matched_array.filter(function(val) {
      return retention.indexOf(val) == -1;
    });

    if (indices_to_remove.length === 0 ) {
      console.log("There are no indices to remove");
      return;
    }

    removeindices(indices_to_remove);
  }

  function removeindices(remove) {
    // Loops through all objects in the indices_to_remove array and
    // carries out a DELETE request for each indices
    remove.forEach(function(value){
      var res_data = "";
      var opts = {
        host: `${endpoint}`,
        method: 'DELETE',
        port: 80,
        path: `/${value}`
      };

      console.log("Attempting to remove the index", value);
      
      var req = http.request(opts, (res) => {
        res.on('data', (response) => {
          res_data += response;
        });
        res.on('end',  function() {
          console.log("Successfully removed", value);
          callback(null, 'success');
        });
      });

      req.write("" + res_data);
      req.end();
    });
  }

};
