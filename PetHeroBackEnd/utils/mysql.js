const mysql = require('mysql');
require('dotenv').config(); 
const sql_info={
	host: process.env.MYSQL_HOST,
	port: process.env.MYSQL_PORT,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASS,
	database: process.env.MYSQL_DB
  }
const pool= mysql.createPool(sql_info);

pool.on('error', err =>
	{
		console.log(`[SQL] : ${err}`)
	});
function query(query)
{
	return new Promise((resolve, reject) => {
		pool.getConnection(function(err, con) {
			con.query(query, function (err, result) {
				con.release();
				if (err)
					reject(err);
				else
					resolve(result);
				})
		});	
	  });
		
    
}
function escape(query)
{
    return pool.escape(query);
}
function end()
{
    pool.end(function(err) {
    console.error(err);
  });
}
module.exports.query=query;
module.exports.escape=escape;
module.exports.end=end;
    