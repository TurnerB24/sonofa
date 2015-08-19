if (typeof console  != "undefined") {

 {
  //Comment this Block Out if
  var consoleDiv = document.createElement('div');
  consoleDiv.id = 'console';
  document.body.appendChild(consoleDiv);
 }

  function consoleLogToDiv(message, className) {
    var consoleDiv = document.getElementById('console');
    if(consoleDiv === null)
      return;
    var newMsg = document.createElement('div');
    newMsg.className = 'console-'+className;
    newMsg.innerHTML = '<b>'+new Date().toISOString()+"</b>| "+message;
    consoleDiv.appendChild(newMsg);
  }
  
  console.olog = console.log;
  console.log = function(message) {
    console.olog(message);
    consoleLogToDiv(message, 'log');
  };
  
  console.oerror = console.error;
  console.error = function(message) {
    console.oerror(message);
    consoleLogToDiv(message, 'error');
  };
  
  console.owarn = console.warn;
  console.warn = function(message) {
    console.owarn(message);
    consoleLogToDiv(message, 'warn');  
  }
  
  console.oinfo = console.info;
  console.info = function(message) {
    console.oinfo(message);
    consoleLogToDiv(message, 'info');
  };
  
  console.odebug = console.debug;
  console.debug = function(message) {
    console.odebug(message);
    consoleLogToDiv(message, 'debug');
  };
}
