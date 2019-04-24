/************************************************************************/
/*                            EMOJIS                                   */
/**********************************************************************/
  let emojis = ['0x1F600', '0x1F603', '0x1F604', '0x1F601', '0x1F606', '0x1F605', '0x1F923', '0x1F602',
                '0x1F642', '0x1F643', '0x1F609', '0x1F60A', '0x1F607', '0x1F60D', '0x1F929', '0x1F618',
                '0x1F617', '0x1F61A', '0x1F619', '0x1F60B', '0x1F61B', '0x1F61C', '0x1F92A', '0x1F610',
                '0x1F61D', '0x1F911', '0x1F917', '0x1F92D', '0x1F92B', '0x1F914', '0x1F910', '0x1F928',
                '0x1F611', '0x1F636', '0x1F60F', '0x1F612', '0x1F644', '0x1F62C', '0x1F925', '0x1F60C',
                '0x1F614', '0x1F62A', '0x1F924', '0x1F634', '0x1F637', '0x1F912', '0x1F915', '0x1F922',
                '0x1F92E', '0x1F927', '0x1F635', '0x1F92F', '0x1F920', '0x1F60E', '0x1F913', '0x1F9D0',
                '0x2639', '0x1F62E', '0x1F632', '0x1F633', '0x1F626', '0x1F627', '0x1F628', '0x1F630',
      '0x1F625',
      '0x1F622',
      '0x1F62D',
      '0x1F631',
      '0x1F616',
      '0x1F623',
      '0x1F61E',
      '0x1F613',
      '0x1F629',
      '0x1F62B',
      '0x1F624',
      '0x1F621',
      '0x1F620',
      '0x1F92C',
      '0x1F608',
      '0x1F47F',
      '0x1F480',
      '0x2620',
      '0x1F4A9',
      '0x1F47D',
      '0x1F648',
      '0x1F649',
      '0x1F64A',
      '0x1F496',
      '0x1F497',
      '0x1F493',
      '0x1F49E',
      '0x1F495',
      '0x1F494',
      '0x2764',
      '0x1F49B',
      '0x1F49A',
      '0x1F499',
      '0x1F4AF',
      '0x1F44C'];

  var usersPrivado = ['init'];

/************************************************************************/
/*                         ABRIR SALA PRIVADA                          */
/**********************************************************************/
function abrirSalaPrivada(rootPath, from, to) {
  if(jQuery.inArray(to, usersPrivado) == -1){
    usersPrivado.push(to);
    var newRoom = window.open(rootPath + "privado/?private=1&from=" + from +"&to=" + to, "_blank");
    if (!newRoom) 
      alert('Por favor active los pop-ups del navegador');
  }
  else{
    console.log("Chat privado con: " + to + " ya existe.")
  }
  
}

/************************************************************************/
/*                         AJUSTAR SCROLL                              */
/**********************************************************************/
function ajustarScroll() {
  $("#messages")[0].scrollTop = $("#messages")[0].scrollHeight;
}

/************************************************************************/
/*                          CARGAR EMOJIS                              */
/**********************************************************************/
function cargarEmojis() {
  for(let i = 0; i < emojis.length; i++) {
    $("#emojis").append($('<li class ="emojis" id="'+ i + '"onclick="ponerEmoji(this)">').text(String.fromCodePoint(emojis[i])));
    $("#emojis").append($("</li>"));
  }
}

/************************************************************************/
/*                           PONER EMOJIS                              */
/**********************************************************************/
function ponerEmoji(element) {
  var msj = $("#m").val();
  var i = $(element).attr("id");
  // Concatena el mensaje actual mas el emoji
  var mensaje = msj + String.fromCodePoint(emojis[i]);
  $("#m").val(mensaje);
}

/************************************************************************/
/*                              PUBLICO                                */
/**********************************************************************/
function publico(socket, rootPath, nickname, uploader) {
  var numUsers = 0;
  cargarEmojis();
  // Agregamos el titulo

  socket.emit("user connected", nickname);
  $("#messages").append($("<li style=background:#52de7a; >").text(nickname + " bienvenid@ al chat público" + String.fromCodePoint(emojis[2]))); 
  console.log("Enviando nickname al servidor");
 
  // Muestra los usuarios online
  socket.on("display users", function(users) {
    console.log("Recibiendo usuarios: " + users); 
    $("#users li").remove();
    $("#users").append($('<li class="titleOnline"><i id="activo" class="fab fa-get-pocket" style="font-size:26px;color:#52de7a"></i> Usuarios en linea <i id="activo" class="fab fa-get-pocket" style="font-size:26px;color:#52de7a"></i></li>'));
    $("#users").append($('</li>'));    
    
    numUsers = 0;
    for(var i = 0; i < users.length; i++){
      if(users[i].localeCompare(nickname) != 0) {
        numUsers++;
        // Muestra
        $("#users").append($('<li id="'+ users[i] +'" class="users-li"><i class="fas fa-chevron-circle-right" style="font-size:26px;color:#52de7a"></i><button class="btn-users" id="' + users[i] + '">' + users[i] + '</button></li>'));
      }
    }

    if(numUsers > 0)
      $("#messages").append($("<li style=background:#52de7a; >").text(numUsers + " usuarios en línea ")); 
    else
      $("#messages").append($("<li>").text("No hay usuarios en linea " + String.fromCodePoint(emojis[40])));

    ajustarScroll();
  });

  //Envia mensajes
  $("#enviarMensaje").click(function(e) {
    e.preventDefault();
    var msj = $("#m").val();

    if(msj != ""){
      socket.emit("chat message", msj);

      $("#messages").append($("<li>").text(nickname + ": " +msj));
      $("#m").val("");
      ajustarScroll();
    }
  });

  //Envia mensajes al presionar Enter
  $(window).keydown(function(e) {
    if (e.which === 13) {
        e.preventDefault();
      var msj = $("#m").val();

      if(msj != ""){
        socket.emit("chat message", msj);

        $("#messages").append($("<li>").text(nickname + ": " +msj));
        $("#m").val("");
        ajustarScroll();
      }
    }
  });

 // Agrega a los usuarios cuando se conecten
  socket.on("user connected", function(newNickname) {
    console.log("Usuario: " + newNickname + " conectado"); 

    $("#messages").append($("<li style=background:#52de7a; >").text(newNickname + " se ha conectado"));
    ajustarScroll();
  });

  // Elimina el usuario desconectado
  socket.on("user disconnected", function(nickname) {
    console.log("Usuario: " + nickname + " desconectado");

    $("#messages").append($("<li style=background:#52de7a;>").text(nickname + " se ha desconectado " + String.fromCodePoint(emojis[40])));
    $("#" + nickname).remove();

    numUsers--;   
    if(numUsers > 0)
      $("#messages").append($("<li>").text(numUsers + " usuarios en línea")); 
    else
      $("#messages").append($("<li>").text("No hay usuarios en linea" + String.fromCodePoint(emojis[40])));  

    ajustarScroll();  
  });

  socket.on("enable user", function(user){
    console.log("Usuario: " + user + " habiliado para privado.");

    usersPrivado.splice(usersPrivado.indexOf(user), 1);
  })

  // Recibe del servidor los mensajes de otros clientes
  socket.on("chat message", function(data) {
    console.log("Msj: " + data.msg + " de: " + data.nickname);

    $("#messages").append($("<li>").text(data.nickname + ": " + data.msg));
    ajustarScroll();      
  });

  // Recibe del servidor los links de descarga
  socket.on("chat file", function(data) {
    console.log("Link: " + data);
   
    $("#messages").append($(data));   
    ajustarScroll();  
  });

/************************************************************************/
/*                        CHAT PRIVADO                                  */
/************************************************************************/
// Iniciar chat privado con algun usuario
$(document).on("click", ".btn-users", function() {
  var to = $(this).attr("id");
  console.log("Enviando solicitud de chat privado a: " + to);

  var participantes = {
    from: nickname,
    to: to
  };
  
  socket.emit("start private", participantes);
  abrirSalaPrivada(rootPath, nickname, to);
});

 // Se recibe una solicitud para iniciar un chat privado, se une
  socket.on("start private chat", function(room) {
    console.log("Recibida solicitud para unirse al chat privado de: " + room.from);
    abrirSalaPrivada(rootPath, room.to, room.from);
  });

  // Con esto automaticamente carga y sube el archivo :3
  document.getElementById('subir').addEventListener("click", uploader.prompt, false);

/************************************************************************/
/*                  PROGRESO DE SUBIDA                                  */
/************************************************************************/
  
  // Muestra el progreso de subida
  uploader.addEventListener("progress", function(e) {
    var nombre = e.file.name;
    var tam = e.file.size;
    var porcentaje = parseInt(e.bytesLoaded / e.file.size * 100);
    console.log("Nombre: " + nombre);
    console.log("Tam: " + tam);
    console.log("Subiendo: " + porcentaje + "%");
    /* --------------- AQUI HAY QUE APLICAR CSS (ALERT O CUADRO DE DIALOGO PARA TENER ENTRETENIDO AL CLIENTE)*/
    $("#messages").append($("<li>").text("Enviando " + nombre + " de " + tam + " bytes: " + porcentaje + "%"));      
   
    ajustarScroll(); 
  });

  // Envia link de descarga a otros clientes una vez finalizada la subida
  uploader.addEventListener("complete", function(e) {
    console.log(e.success);

    if(e.succes != 1) {
      var nombre = e.file.name;
      var tam = e.file.size;
      console.log(nombre);
      console.log(nombre.length);
      let aux = "";
      for(let i = 0; i < nombre.length; i++) {
        let charNombre = nombre.charAt(i);
        if(charNombre == ".") {
          for(let j = i; j < nombre.length; j++) {
            charNombre = nombre.charAt(j);
            aux = aux + charNombre; 
          }
          break;
        }
      }
      console.log("extension: " + aux);
      if(aux === ".PNG" || aux == ".jpg" || aux == ".JPG" || aux == ".png" || aux == ".jpeg" || aux == ".JPEG") {
      	var ancho = $(window).width() * 0.2;
        var imagenFile = '<li>' + nickname + ': ' + '<img class = "imagen-chat" src="' + rootPath + 'uploads/' + nombre + '" width="' + ancho + '"></li>';
        console.log("Envio mi imagen a MOSTRAR CHAT");
        socket.emit("chat file", imagenFile);
        $("#messages").append($(imagenFile));
        //ajustarScroll();
      }
      else{
		var msjFile = '<li>' + nickname + ': ' + '<a href="' + rootPath + 'uploads/' + nombre + '" download>' + nombre + '. ' + tam + ' bytes</a></li>';
		socket.emit("chat file", msjFile);
		$("#messages").append($(msjFile)); 
      } 
      ajustarScroll();
    }
  });
} 