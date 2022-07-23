// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var app = new Framework7({
  // App root element
  root: '#app',
  // App Name
  name: 'My App',
  // App id
  id: 'com.myapp.test',
  // Enable swipe panel
  panel: {
    swipe: 'left',
  },
  // Add default routes
  routes: [
    { path: '/index/', url: 'index.html', },
    { path: '/login/', url: 'login.html', },
    { path: '/about/', url: 'about.html', },
    { path: '/inicio-sesion/', url: 'inicio-sesion.html', },
    { path: '/panel-usuario/', url: 'panel-usuario.html', },
    { path: '/panel-admin/', url: 'panel-admin.html', },
    { path: '/registro-datos/', url: 'registro-datos.html', },
  ]
  // ... other parameters
});

var mainView = app.views.create('.view-main');

var db, email;
var colUsuarios;
var rol = "developer";

var latitud = 0, longitud = 0;

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
  console.log("Device is ready!");

  db = firebase.firestore();
  colUsuarios = db.collection("usuarios");

  // sembrado();

  var onSuccess = function (position) {
    /*  alert('Latitude: ' + position.coords.latitude + '\n' +
        'Longitude: ' + position.coords.longitude + '\n' +
        'Altitude: ' + position.coords.altitude + '\n' +
        'Accuracy: ' + position.coords.accuracy + '\n' +
        'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
        'Heading: ' + position.coords.heading + '\n' +
        'Speed: ' + position.coords.speed + '\n' +
        'Timestamp: ' + position.timestamp + '\n');*/
    latitud = position.coords.latitude;
    longitud = position.coords.longitude;
  };

  // onError Callback receives a PositionError object
  //
  function onError(error) {
    alert('code: ' + error.code + '\n' +
      'message: ' + error.message + '\n');
  }

  navigator.geolocation.getCurrentPosition(onSuccess, onError);

});

// Option 1. Using one 'page:init' handler for all pages
$$(document).on('page:init', function (e) {
  // Do something here when page loaded and initialized
  console.log(e);
})

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="index"]', function (e) {
  // Do something here when page with data-name="about" attribute loaded and initialized

  $$('#btnGaleria').on('click', fnGaleria);
  $$('#btnCamara').on('click', fnCamara);

  $$('#bRegistro').on('click', fnRegistro);
  
})

$$(document).on('page:init', '.page[data-name="inicio-sesion"]', function (e) {
  $$('#bIngresa').on('click', fnIngresa);
})

$$(document).on('page:init', '.page[data-name="registro-datos"]', function (e) {
  $$('#bRegistroFin').on('click', fnRegistroFin);
})

$$(document).on('page:init', '.page[data-name="panel-admin"]', function (e) {

  colUsuarios.where("rol", "==", "developer")
    .get()
    .then((querySnapshot) => {
      datosCard = ``;
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        //console.log(doc.id, " => ", doc.data().nombre);

        nombreUsuario = doc.data().nombre;
        apellidoUsuario = doc.data().apellido;
        paisUsuario = doc.data().pais;
        fnacUsuario = doc.data().fechaNac;
        rolUsuario = doc.data().rol;
        telefonoUsuario = doc.data().telefono;
        emailUsuario = doc.id;

        datosCard += `
            <div class="card">
                  <div class="card-header">${nombreUsuario} ${apellidoUsuario}</div>
                  <div class="card-content card-content-padding">
                    <div class="row">
                      <div class="col-100">${paisUsuario}</div>
                      <div class="col-100">${email}</div>
                      <div class="col-50">${fnacUsuario}</div>
                      <div class="col-50">${telefonoUsuario}</div>
                    </div>
                  </div>
                  <div class="card-footer">ROL: ${rolUsuario}</div>
                </div>
                `;
        $$('#listaUsuarios').html(datosCard);
      });
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });

})

$$(document).on('page:init', '.page[data-name="panel-usuario"]', function (e) {
  //Si es developer
  datosCard = `
  <div class="card">
        <div class="card-header">${nombreUsuario} ${apellidoUsuario}</div>`

  datosCard += `<div class="card-content card-content-padding">
          <div class="row">
            <div class="col-100">${paisUsuario}</div>
            <div class="col-100">${email}</div>
            <div class="col-50">${fnacUsuario}</div>
            <div class="col-50">${telefonoUsuario}</div>
          </div>
        </div>
        <div class="card-footer">ROL: ${rol}</div>
      </div>
      `;
  if (rol == "admin") {

  }
  $$('#datosUsuario').html(datosCard);
})


function fnRegistroFin() {
  //identificador
  elId = email;
  //recuperar datos del formulario
  nombreUsuario = $$('#rNombre2').val();
  apellidoUsuario = $$('#rApellido2').val();
  paisUsuario = $$('#rPais2').val();
  telefonoUsuario = $$('#rTelefono2').val();
  fnacUsuario = $$('#rFNac2').val();

  //construyo el objeto de datos JSON

  var datos = {
    nombre: nombreUsuario,
    apellido: apellidoUsuario,
    pais: paisUsuario,
    telefono: telefonoUsuario,
    fechaNac: fnacUsuario,
    rol: rol
  }

  colUsuarios.doc(elId).set(datos)
    .then(function (ok) {
      console.log("Registro en BD OK!");
      mainView.router.navigate('/panel-usuario/');

    })
    .catch(function (e) { console.log("Error en BD" + e) })
}

var nombreUsuario, apellidoUsuario, paisUsuario, telefonoUsuario, fnacUsuario, rolUsuario;

function fnIngresa() {
  email = $$('#lEmail').val();
  password = $$('#lPassword').val();

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;

      $$('#lMensaje').html("Bienvenido a mi App !!");

      console.log("Ingreso correcto");

      //DEPENDIENDO DEL ROL, REDIRIGIR A LA PAGINA CORRECTA

      var docRef = colUsuarios.doc(email);
      docRef.get().then((doc) => {
        if (doc.exists) {
          //console.log("Document data:", doc.data());

          nombreUsuario = doc.data().nombre;
          apellidoUsuario = doc.data().apellido;
          paisUsuario = doc.data().pais;
          fnacUsuario = doc.data().fechaNac;
          rolUsuario = doc.data().rol;
          telefonoUsuario = doc.data().telefono;

          if (rolUsuario == "admin") {
            mainView.router.navigate('/panel-admin/');
          } else {
            mainView.router.navigate('/panel-usuario/');
          }


        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
      });

      // mainView.router.navigate('/panel-usuario/');
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;

      console.error(errorCode + " -- " + errorMessage);

      switch (errorCode) {
        case "auth/wrong-password": mensaje = "La contraseña es incorrecta";
          break;

        case "auth/user-not-found": mensaje = "El correo electrónico no está registrado";
          break;

        default: mensaje = "Intente de nuevo";
      }

      $$('#lMensaje').html("Hubo un error. " + mensaje);
    });
}


function fnRegistro() {
  email = $$('#rEmail').val();
  password = $$('#rPassword').val();

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;

      $$('#rMensaje').html("Bienvenido a mi App !!");

      console.log("Usuario creado");

      mainView.router.navigate('/registro-datos/');
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;

      console.error(errorCode + " -- " + errorMessage);

      switch (errorCode) {
        case "auth/weak-password": mensaje = "La contraseña es muy débil";
          break;

        case "auth/email-already-in-use": mensaje = "El correo electrónico ya está en uso";
          break;

        default: mensaje = "Intente de nuevo";
      }

      $$('#rMensaje').html("Hubo un error. " + mensaje);


      // ..
    });
}

function fnCamara() {
  // FOTO DESDE CAMARA
  navigator.camera.getPicture(onSuccessCamara, onErrorCamara,
    {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA
    });
}


function fnGaleria() {
  navigator.camera.getPicture(onSuccessCamara, onErrorCamara,
    {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY
    });

}

function onSuccessCamara(imageURI) {
  $$("#foto").attr("src", imageURI);
  // RESTA QUE ESTA FOTO SUBA AL STORAGE…. O HACER OTRA COSA...

}
function onErrorCamara() {
  console.log('error de camara');
}



function sembrado() {
  /* console.log("Iniciando el sembrado de datos...");
 
  var data1 = { nombre: "Admin", apellido: "uno", rol: "admin" };
   elId1 = "uno@admin.com";
   clave1 = "admin1";
 
   firebase.auth().createUserWithEmailAndPassword(elId1, clave1)
     .then(function () {
       colUsuarios.doc(elId1).set(data1)
         .then(function (ok) { console.log("Nuevo ok"); })
     })
     .catch(function (e) {
       console.log("Error: " + e)
     });
 
   var data2 = { nombre: "Admin", apellido: "uno", rol: "admin" };
   elId2 = "dos@admin.com";
   clave2 = "admin2";
 
   firebase.auth().createUserWithEmailAndPassword(elId2, clave2)
     .then(function () {
       colUsuarios.doc(elId2).set(data2)
         .then(function (ok) { console.log("Nuevo ok"); })
     })
     .catch(function (e) {
       console.log("Error: " + e)
     });*/




  /* colUsuarios.doc(elId).set(data)
     .then(function (ok) { console.log("Nuevo ok"); })
     .catch(function (e) { console.log("Error: " + e) })*/

  /* db.collection("personas").add(data)
    .then(function(docRef){
      console.log("OK! con el Id " + docRef.id);
    })
    .catch(function (error) {
      console.log("Error: " + error);
    })*/

  console.log("Fin del sembrado de datos...");
}