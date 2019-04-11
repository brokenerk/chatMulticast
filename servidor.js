var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var siofu = require("socketio-file-upload");

// Construye el HTML del cliente
app.use(express.static(__dirname + "/public"));
app.use(siofu.router);

app.get('/', function(req, res) {
  res.sendFile(__dirname + "/public/login.html");
});

app.get('/publico', function(req, res){
  res.sendFile(__dirname + "/public/publico.html");
});

app.get('/privado', function(req, res){
  res.sendFile(__dirname + "/public/privado.html");
});

server.listen(process.env.PORT || 3003, () => {
 console.log("server started at port 3003");
});

var usersOnline = [];
var socketIDPublico = {};
var socketIDPrivado = {};
var idGrupal = 'idGrupal';

// ################## CHAT PUBLICO ####################
function sendAllUsersOnline(io, socket) {
	console.log("Enviando usuarios " + usersOnline);
	io.emit("display users", usersOnline);
}

// Escucha las peticiones de los clientes conectados
io.on("connection", function(socket) {

	// ################## SUBIDA DE ARCHIVOS ####################
	var uploader = new siofu();
	uploader.dir = __dirname + "/public/uploads";
	uploader.listen(socket);

	// El archivo subido se guardo en el servidor
	uploader.on("saved", function(e){
		console.log(e.file);
	})

	// Ocurrio un error al guardar archivos
	uploader.on("error", function(e){
		console.log("Error: " + e);
	})

	// Se conecta un cliente
	socket.on("user connected", function(nickname) {
		if(nickname in usersOnline) {
			console.log("Usuario ya registrado");
		}
		else {
			socket.nickname = nickname;
			socket.privado = 0;
			socketIDPublico[socket.nickname] = socket.id;
			usersOnline.push(socket.nickname);

			console.log(socket.nickname + " conectado. ID: " + socket.id + ". Privado = " + socket.privado);
			
			socket.broadcast.emit("user connected", socket.nickname);
			sendAllUsersOnline(io, socket);
		}
	});

	// El cliente envia un mensaje
	socket.on("chat message", function(msg) {
		console.log("Msj recibido de: " + socket.nickname + ". Enviando...");
		
		//El servidor envia el mensaje a todos los demas
		socket.broadcast.emit("chat message", {
			nickname: socket.nickname,
			msg: msg
		});
	});

	//El cliente se desconecta
	socket.on("disconnect", function() {
		//El servidor notifica todos los demas
		if(socket.privado == 1) {
			socket.privado = 0;
			console.log(socket.nickname + " abandono una sala privada. Privado = " + socket.privado);
			
			socket.broadcast.emit("user leaves", socket.nickname);
		}
		else {
			console.log(socket.nickname + " desconectado. Privado = " + socket.privado);
			
			usersOnline.splice(usersOnline.indexOf(socket.nickname), 1);
			socket.broadcast.emit("user disconnected", socket.nickname);
			sendAllUsersOnline(socket);
		}
  	});

	//El cliente envia un link de descarga
	socket.on("chat file", function(linkMsj) {
		console.log("Link recibido. Enviando...");
		
		//El servidor envia el link a todos los demas
		socket.broadcast.emit("chat file", linkMsj);
	});

	//########################## CHAT PRIVADO #################################
	// Un cliente quiere iniciar un chat privado con otro
	socket.on("start private", function(room) {
		console.log(room.from + " quiere iniciar un chat privado con " + room.to);

		// Enviamos solicitud al destinatario
		socket.to(socketIDPublico[room.to]).emit("start private chat", {
			from: room.from,
			to: room.to,
		});
	});

	// Se registran los nuevos IDs de socket privados 
	socket.on("private IDs", function(nickname) {
		socket.nickname = nickname;
		socket.privado = 1;
		console.log(socket.nickname + " unido a chat privado con nueva ID: " + socket.id + ". Privado = " + socket.privado);
		
		socketIDPrivado[socket.nickname] = socket.id;
	});

	// El cliente envia un mensaje privado
	socket.on("private chat message", function(data) {
		console.log("Msj privado recibido de: " + socket.nickname + ". Enviando a " + data.to);
		
		var id = socketIDPrivado[data.to];
		//El servidor envia el mensaje a todos los demas
		socket.to(id).emit("private chat message", {
			nickname: socket.nickname,
			msg: data.msg
		});
	});

	// El cliente envia un link de descarga privado
	socket.on("private chat file", function(data){
		console.log("Link privado recibido. Enviando...");
		var id = socketIDPrivado[data.to];
		//El servidor envia el link a todos los demas
		socket.to(id).emit("private chat file", data.link);
	});
});

