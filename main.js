const http = require('http');
const fs = require('fs');
const mysql = require('mysql2');
const express = require('express');
const app = express();
var messages_validation_array = [];
var messages_validation_string = '';
const cors = require("cors");
var bodyParser = require('body-parser');
const moment = require('moment');
var net = require('net');

const host = 'localhost';
const user = 'root';
const password = '';
const database = 'system_nodejs_api';

const corsOptions = {
  origin: "http://localhost:4200",
};
app.use(cors(corsOptions));

var $;
$ = require('jquery');
        
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/kamery/edytuj/:id', function(request, response) {
    var connection = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: database
    });
    connection.connect((error) => {
        if(error)
        {
            var res;
            response.writeHead(200, {'Content-type':'application/json; charset=utf-8'});
            res = {status: false, message: error};
            response.end(JSON.stringify(res));
        }
        else
        {
            var res;
            const id = parseInt(request.params.id);
            connection.query("SELECT id, name, status, ip, nr_on_plan, type_id, floor, DATE_FORMAT(last_check_datetime, '%d-%m-%Y %H:%i:%s') last_check_datetime, DATE_FORMAT(create_datetime, '%d-%m-%Y %H:%i:%s') create_datetime, DATE_FORMAT(update_datetime, '%d-%m-%Y %H:%i:%s') update_datetime, deleted FROM cameras WHERE id = " + id.toString(), function(err, result, field) {
                if (err)
                {
                    response.writeHead(200, {'Content-type':'application/json; charset=utf-8'});
                    res = {status: false, message: err};
                    response.end(JSON.stringify(res));
                }
                else
                {
                    response.writeHead(200, {'Content-type':'application/json; charset=utf-8'});
                    res = {status: true, result: result};
                    response.end(JSON.stringify(res));
                }
            });
        }
    });
});

app.get('/kamery/:pageNum/:pageSize', (request, response) => {
    var connection = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: database
    });
    connection.connect((error) => {
        if(error)
        {
            var res;
            response.writeHead(200, {'Content-type':'application/json; charset=utf-8'});
            res = {status: false, message: error};
            response.end(JSON.stringify(res));
        }
        else
        {
            connection.query("SELECT COUNT(*) AS numRows FROM cameras", function(err, result, field) {
                var res;
                const pageNum = parseInt(request.params.pageNum);
                const pageSize = parseInt(request.params.pageSize);
                const numRows = parseInt(result[0].numRows);
                var pageNums;
                if (err)
                {
                    response.writeHead(200, {'Content-type':'application/json; charset=utf-8'});
                    res = {status: false, message: err};
                    response.end(JSON.stringify(res));
                }
                else
                {
                    if (numRows <= pageSize)
                    {
                        pageNums = 1;
                    }
                    else
                    {
                        pageNums = Math.ceil(numRows / pageSize);
                    }
                    if (!isNaN(pageNum))
                    {
                        const offset = (pageNum - 1) * pageSize;
                        connection.query("SELECT id, name, status, ip, nr_on_plan, type_id, floor, DATE_FORMAT(last_check_datetime, '%d-%m-%Y %H:%i:%s') last_check_datetime, DATE_FORMAT(create_datetime, '%d-%m-%Y %H:%i:%s') create_datetime, DATE_FORMAT(update_datetime, '%d-%m-%Y %H:%i:%s') update_datetime, deleted FROM cameras LIMIT " + offset.toString() + "," + pageSize.toString(), function(err2, result2, field2) {
                            if (err2)
                            {
                                response.writeHead(200, {'Content-type':'application/json; charset=utf-8'});
                                res = {status: false, message: err2};
                                response.end(JSON.stringify(res));
                            }
                            else
                            {
                                response.writeHead(200, {'Content-type':'application/json; charset=utf-8'});
                                res = {status: true, result: result2, numRows: numRows, pageNum: pageNum, pageSize: pageSize, pageNums: pageNums};
                                response.end(JSON.stringify(res));
                            }
                        });
                    }
                    else
                    {
                        response.statusCode = 404;
                        response.setHeader('Content-type', 'text/html; charset=utf8');
                        response.end('<h1>404 nie znaleziono</h1>');
                    }
                }
            });
        }
    });
});

app.post('/kamery/dodaj_aktualizuj', function(request, response) {
    var connection = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: database
    });
    connection.connect((error) => {
        if(error)
        {
            var res;
            response.writeHead(200, {'Content-type':'application/json; charset=utf-8'});
            res = {status: false, message: error};
            response.end(JSON.stringify(res));
        }
        else
        {
            var res;
            var name = request.body.name;
            var status = request.body.status;
            var ip = request.body.ip;
            var nr_on_plan = request.body.nr_on_plan;
            var type_id = request.body.type_id;
            var floor = request.body.floor;
            var create_datetime = moment().format('YYYY-MM-DD HH:mm:ss');
            var update_datetime = moment().format('YYYY-MM-DD HH:mm:ss');
            var id = request.body.id;

            if (validation(name, status, ip, nr_on_plan, type_id, floor))
            {
                if (id === undefined)
                {
                    connection.query("INSERT INTO cameras(name, status, ip, nr_on_plan, type_id, floor, last_check_datetime, create_datetime, " + 
                            "update_datetime, deleted) VALUES('" + name + "', '" + status.toString() + "', '" + ip + "', '" + nr_on_plan + "', " + 
                            type_id + ", '" + floor + "', null, '" + create_datetime + "', '" + update_datetime + "',0)", function(err, result) {

                        if (err)
                        {
                            response.writeHead(200, {'Content-type':'application/json; charset=utf-8'});
                            res = {status: false, message: err};
                            response.end(JSON.stringify(res));
                        }
                        else
                        {
                            res = {status: true, message: 'Kamera została dodana'};
                            response.statusCode = 200;
                            response.setHeader('Content-type', 'application/json; charset=utf8');
                            response.end(JSON.stringify(res));
                        }
                    });
                }
                else
                {
                    connection.query("UPDATE cameras SET name = '" + name + "', status = '" + status.toString() + "', ip = '" + ip + "', nr_on_plan = '" + 
                            nr_on_plan + "', type_id = '" + type_id + "', floor = '" + floor + "', update_datetime = '" + update_datetime + "' WHERE " + 
                            "id = " + id, function(err, result) {

                        if (err)
                        {
                            response.writeHead(200, {'Content-type':'application/json; charset=utf-8'});
                            res = {status: false, message: err};
                            response.end(JSON.stringify(res));
                        }
                        else
                        {
                            res = {status: true, message: 'Kamera została zaktualizowana'};
                            response.statusCode = 200;
                            response.setHeader('Content-type', 'application/json; charset=utf8');
                            response.end(JSON.stringify(res));
                        }
                    });
                }
            }
            else
            {
                res = {status: false, message: messages_validation_string};
                response.statusCode = 200;
                response.setHeader('Content-type', 'application/json; charset=utf8');
                response.end(JSON.stringify(res));
            }
        }
    });
});

app.post('/kamery/usun', function(request, response) {
    var connection = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: database
    });
    connection.connect((error) => {
        if(error)
        {
            var res;
            response.writeHead(200, {'Content-type':'application/json; charset=utf-8'});
            res = {status: false, message: error};
            response.end(JSON.stringify(res));
        }
        else
        {
            var res;
            var id = request.body.id;

            if (id !== undefined)
            {
                connection.query("DELETE FROM cameras WHERE id = " + id, function(err, result) {
                    if (err)
                    {
                        response.statusCode = 200;
                        response.setHeader('Content-type', 'application/json; charset=utf8');
                        res = {status: false, message: err};
                        response.end(JSON.stringify(res));
                    }
                    else
                    {
                        res = {status: true, message: 'Kamera została usunięta'};
                        response.statusCode = 200;
                        response.setHeader('Content-type', 'application/json; charset=utf8');
                        response.end(JSON.stringify(res));
                    }
                });
            }
            else
            {
                res = {status: false, message: 'Pole id jest wymagane'};
                response.statusCode = 200;
                response.setHeader('Content-type', 'application/json; charset=utf8');
                response.end(JSON.stringify(res));
            }
        }
    });
});

app.get('/', (request, response) => {
    response.statusCode = 200;
    response.setHeader('Content-type', 'application/json; charset=utf8');
    response.end('Strona główna');
});

app.listen(8000);

function validation(name, status, ip, nr_on_plan, type_id, floor)
{
    var status = true;
    var message = '';
    messages_validation_array = [];
    messages_validation_string = '';
    
    if (name.trim() == '')
    {
        status = false;
        message = 'Pole nazwy kamery jest wymagane';
        messages_validation_array.push(message);
    }
    
    if (status === undefined || status === null)
    {
        status = false;
        message = 'Pole statusu jest wymagane';
        messages_validation_array.push(message);
    }
    
    if (ip.trim() == '')
    {
        status = false;
        message = 'Pole adresu IP jest wymagane';
        messages_validation_array.push(message);
    }
    
    if (!net.isIP(ip))
    {
        status = false;
        message = 'Pole adresu IP musi być prawidłowym adresem IP';
        messages_validation_array.push(message);
    }
    
    if (nr_on_plan.trim() == '')
    {
        status = false;
        message = 'Pole numeru na planie jest wymagane';
        messages_validation_array.push(message);
    }
    
    if (type_id.trim() == '')
    {
        status = false;
        message = 'Pole type_id jest wymagane';
        messages_validation_array.push(message);
    }
    
    if (floor.trim() == '')
    {
        status = false;
        message = 'Pole numeru piętra jest wymagane';
        messages_validation_array.push(message);
    }
    
    messages_validation_string = messages_validation_array.join('</br>');
    
    return status;
}
