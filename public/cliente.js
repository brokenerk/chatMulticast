$(function () {
  var rootPath = "https://chat-multicast.herokuapp.com/";
  //var rootPath = "http://localhost:3003/";
  var socket = io();
  // ---------------------- SUBIR ARCHIVOS
  var uploader = new SocketIOFileUpload(socket);

  //Para obtener el nickname desde GET
  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  } 

  var private = getParameterByName("private");
  var nickname = getParameterByName("nickname");
  var from = getParameterByName("from");
  var to = getParameterByName("to");

  if(private == 0) {
    publico(socket, rootPath, nickname, uploader);
  }
  else {
    privado(socket, rootPath, from, to, uploader);
  }
});