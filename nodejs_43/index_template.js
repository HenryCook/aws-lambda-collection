'use strict';

const http = require('http');

exports.handler = function(event,context) {
  var endpoint = 'foo.bar.com';  // Elasticsearch endpoint

  var index_template = JSON.stringify({
                                        "order": 0,
                                        "template": "logstash-*",
                                        "settings": {
                                        "index": {
                                          "index.refresh_interval": "5s",
                                          "index.number_of_replicas": "1",
                                          "index.number_of_shards": "1"
                                        }
                                      },
                                      "mappings": {
                                        "_default_": {
                                          "dynamic_templates": [
                                            {
                                              "message_field": {
                                                "mapping": {
                                                  "index": "analyzed",
                                                  "omit_norms": true,
                                                  "type": "string"
                                                },
                                                "match_mapping_type": "string",
                                                "match": "message"
                                              }
                                            },
                                            {
                                              "string_fields": {
                                                "mapping": {
                                                  "index": "analyzed",
                                                  "omit_norms": true,
                                                  "type": "string",
                                                  "fields": {
                                                    "raw": {
                                                      "ignore_above": 256,
                                                      "index": "not_analyzed",
                                                      "type": "string"
                                                    }
                                                  }
                                                },
                                                "match_mapping_type": "string",
                                                "match": "*"
                                               }
                                            }
                                          ],
                                           "_all": {
                                           "omit_norms": true,
                                           "enabled": true
                                          },
                                          "properties": {
                                            "geoip": {
                                              "dynamic": true,
                                              "type": "object",
                                              "properties": {
                                                "location": {
                                                  "type": "geo_point"
                                                }
                                              }
                                            },
                                            "@version": {
                                              "index": "not_analyzed",
                                              "type": "string"
                                            }
                                          }
                                        }
                                      },
                                      "aliases": {}
                                    });

  var opts = {
    host: endpoint,
    method: 'PUT',
    port: 80,
    path: `/_template/logstash`,
    body: index_template,
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': index_template.length
    }
  };

  var post_req = http.request(opts, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('Response: ' + chunk);
    });
  });

   // post the data
  post_req.write(index_template);
  post_req.end();     
  

};
