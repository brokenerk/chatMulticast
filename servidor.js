var express = require("express");
var app = express();
var server = require("http").Server(app); //Servidor
var io = require("socket.io")(server); //SocketIO
var siofu = require("socketio-file-upload"); //SocketIO File Uploader

// Construye el HTML del cliente
app.use(express.static(__dirname + "/public"));
app.use(siofu.router);

app.get('/', function(req, res) {
  res.sendFile(__dirname + "/public/login.html");
});

app.get('/publico', function(req, res) {
  res.sendFile(__dirname + "/public/publico.html");
});

app.get('/privado', function(req, res) {
  res.sendFile(__dirname + "/public/privado.html");
});

server.listen(process.env.PORT || 3003, () => {
 console.log("Servidor iniciado en localhost:3003");
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
	//El directorio en donde se subiran y encontraran todos los archivos
	uploader.dir = __dirname + "/public/uploads";
	uploader.listen(socket);

	// El archivo subido se guardo en el servidor
	uploader.on("saved", function(e){
		console.log(e.file);
	});

	// Ocurrio un error al guardar archivos
	uploader.on("error", function(e){
		console.log("Error: " + e);
	});

	// Se conecta un cliente
	socket.on("user connected", function(nickname) {
		//Revisa que el nickname no este en uso actualmente
		if(nickname in usersOnline)
			console.log("Usuario ya registrado");
		else {
			socket.nickname = nickname;
			socket.privado = 0;
			//Guarda en arreglos
			socketIDPublico[socket.nickname] = socket.id;
			usersOnline.push(socket.nickname);

			console.log(socket.nickname + " conectado. ID: " + socket.id + ". Privado = " + socket.privado);
			//Avisa a los demás clientes que uno nuevo se conecto
			socket.broadcast.emit("user connected", socket.nickname);
			//Actualiza a todos los clientes la lista de usuarios en linea
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
		if(socket.privado == 1) {
			//El usuario abandono una sala privada, no se avisa en el chat publico
			socket.privado = 0;
			console.log(socket.nickname + " abandono una sala privada. Privado = " + socket.privado);
			
			socket.broadcast.emit("user leaves", socket.nickname);
			socket.broadcast.emit("enable user", socket.nickname);
		}
		else {
			//El usuario se fue de la aplicacion, se avisa en el chat público
			console.log(socket.nickname + " desconectado. Privado = " + socket.privado);
			
			usersOnline.splice(usersOnline.indexOf(socket.nickname), 1);
			//El servidor notifica todos los demas
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
	// Un cliente quiere iniciar un chat privado con otro - HandShake
	socket.on("start private", function(room) {
		console.log(room.from + " quiere iniciar un chat privado con " + room.to);

		// Enviamos notificacion unicamente al destinatario
		socket.to(socketIDPublico[room.to]).emit("start private chat", {
			from: room.from,
			to: room.to,
		});
	});

	// Se registran los nuevos IDs de socket privados
	socket.on("private IDs", function(nickname) {
		socket.nickname = nickname;
		socket.privado = 1;
		//Usuarios se unen al chat privado con un ID de socket nuevo - privado
		console.log(socket.nickname + " unido a chat privado con nueva ID: " + socket.id + ". Privado = " + socket.privado);
		//Se registra el ID en el arreglo de privados
		socketIDPrivado[socket.nickname] = socket.id;
	});

	// El cliente envia un mensaje privado
	socket.on("private chat message", function(data) {
		console.log("Msj privado recibido de: " + socket.nickname + ". Enviando a " + data.to);
		
		//El servidor busca el ID privado del destinatario por medio de su nickname
		var id = socketIDPrivado[data.to];
		//El servidor envia el mensaje, junto al remitente, unicamente al destinario
		socket.to(id).emit("private chat message", {
			nickname: socket.nickname,
			msg: data.msg
		});
	});

	// El cliente envia un link de descarga privado
	socket.on("private chat file", function(data){
		console.log("Link privado recibido. Enviando...");
		//El servidor busca el ID privado del destinatario por medio de su nickname
		var id = socketIDPrivado[data.to];
		//El servidor envia el link unicamente al destinario
		socket.to(id).emit("private chat file", data.link);
	});
});

