'use strict';
// La autenticación debe realizarse en el servicio privado, nunca en el navegador.
// Mientras ese servicio no esté conectado, se deniega todo acceso al panel.
document.querySelector('#show-password').addEventListener('change',event=>{
 document.querySelector('#login-password').type=event.target.checked?'text':'password';
});
document.querySelector('#admin-login').addEventListener('submit',event=>{
 event.preventDefault();
 document.querySelector('#login-password').value='';
 document.querySelector('#login-status').textContent='No se inició sesión. El servicio privado de autenticación todavía no está conectado. Intenta nuevamente cuando el acceso esté activado.';
});
