var request = require('request');
var mysql = require('mysql');
var config = require('./config.js');

var pool = mysql.createPool({ // Initialize the MySQL connection pool. Defaulting to 25 connections here, may need to increase later.
    connectionLimit: 25,
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.db,
    port: config.database.port
});

let URL = "https://slack.com/api/conversations.history?token=" + config.token + "&channel=" + config.channel;

request(URL, function (error, response, body) {
	body = JSON.parse(body);
	for(let i=0; i<body.messages.length; i++) {
		if(body.messages[i].type==="message"&&body.messages[i].subtype==undefined) { // subtype indicates its an announcement or some garbage
			pool.query('INSERT IGNORE INTO ' + config.database.table + ' (id, words, author, ts) VALUES (?, ?, ?, FROM_UNIXTIME(?))', [body.messages[i].client_msg_id, body.messages[i].text, body.messages[i].user, body.messages[i].ts], function (error, results, fields) {
            			if(error){
                			console.error(error.message);
            			}
        		});
		}
	}
	pool.end();
	process.exit();
});

