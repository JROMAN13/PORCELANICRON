/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready


/*document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
}*/

// Handle Cordova Device Ready Event

var db, email, timestamp;
var colUsuarios, colPedidos;
var rol = "usuario";
var estado = "pendiente";

$(document).ready(function () {
    //$(document).on('ready', function () {
    console.log("Ready - index");

    // aca tus fnciones 

    db = firebase.firestore();
    colUsuarios = db.collection("usuarios");
    colPedidos = db.collection("pedidos");

    $('#bRegistro').on('click', fnRegistro);
    $('#bRegistroFin').on('click', fnRegistroFin);
    $('#bIngresa').on('click', fnIngresa);
    $('#bRegPedido').on('click', fnRegPedido);


    // Buscar panel admin
    $("#myInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#myDIV tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });


    // FUNCION USUARIO NAVS   

    $('#listarU').click(function () {
        $('#listaPedidos').show();
        $('#nav2').addClass("invisible")
    });

    $('#registroU').click(function () {
        $('#nav2').removeClass("invisible").addClass("visible");
        $('#listaPedidos').hide();
    });



    function fnRegistro() {
        email = $('#rEmail').val();
        password = $('#rPassword').val();
        console.log("Entro a registro");
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                var user = userCredential.user;

                var storage = sessionStorage;
                // Guardar datos en sessionStorage
                storage.setItem('emailUsuario', email);

                $('#rMensaje').html("Bienvenido a mi App !!");

                console.log("Usuario creado");

                location.href = 'registro-datos.html';
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

                    case "auth/invalid-email": mensaje = "El correo electrónico o contraseña no son válidos";
                        break;

                    default: mensaje = "Intente de nuevo";
                }

                //  $('#rMensaje').html("Hubo un error. " + mensaje);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Hubo un error. ' + mensaje,
                    //footer: '<a href="">Why do I have this issue?</a>'
                })
                // ..
            });
    }

    var nombreUsuario, apellidoUsuario, paisUsuario, telefonoUsuario, fnacUsuario, rolUsuario;

    function fnRegistroFin() {
        //identificador
        var storage = sessionStorage;

        // Recuperar datos de sessionStorage
        email = storage.getItem('emailUsuario');
        elId = email;
        //recuperar datos del formulario
        nombreUsuario = $('#rNombre2').val();
        apellidoUsuario = $('#rApellido2').val();
        paisUsuario = $('#rPais2').val();
        telefonoUsuario = $('#rTelefono2').val();
        fnacUsuario = $('#rFNac2').val();

        //construyo el objeto de datos JSON

        var datos = {
            nombre: nombreUsuario,
            apellido: apellidoUsuario,
            pais: paisUsuario,
            telefono: telefonoUsuario,
            fechaNac: fnacUsuario,
            rol: rol
        }
        console.log(elId);
        colUsuarios.doc(elId).set(datos)
            .then(function (ok) {
                alert(elId);
                console.log("Registro en BD OK!");
                location.href = 'panel-usuario.html';

            })
            .catch(function (e) { console.log("Error en BD" + e) })
    }

    function fnIngresa() {

        //identificador
        email = $('#lEmail').val();
        password = $('#lPassword').val();

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in

                var user = userCredential.user;

                var storage = sessionStorage;
                // Guardar datos en sessionStorage
                storage.setItem('emailUsuario', email);
                console.log(email);

                //$('#rMensaje').html("Bienvenido a mi App !!");

                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Bienvenido a mi App !!' + email,
                    showConfirmButton: false,
                    timer: 5000
                })
                console.log(email);
                console.log("Ingreso correcto");

                //DEPENDIENDO DEL ROL, REDIRIGIR A LA PAGINA CORRECTA

                /* var storage = sessionStorage;
                     // Recuperar datos de sessionStorage
                     email = storage.getItem('emailUsuario');*/


                var docRef = colUsuarios.doc(email);
                docRef.get().then((doc) => {
                    console.log(email);


                    if (doc.exists) {
                        //console.log("Document data:", doc.data());                      

                        nombreUsuario = doc.data().nombre;
                        apellidoUsuario = doc.data().apellido;
                        paisUsuario = doc.data().pais;
                        fnacUsuario = doc.data().fechaNac;
                        rolUsuario = doc.data().rol;
                        telefonoUsuario = doc.data().telefono;

                        if (rolUsuario == "admin") {
                            location.href = 'panel-admin.html';
                        } else {
                            location.href = 'panel-usuario.html';
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

                // $('#lMensaje').html("Hubo un error. " + mensaje);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Hubo un error. ' + mensaje,
                    //footer: '<a href="">Why do I have this issue?</a>'
                })
            });
    }

    var pMaterial, pTamano, pCantidad, pFechaEnt, pFiles, pDescripcion;

    function fnRegPedido() {
        var timestamp = Date.now();
        console.log(timestamp);

        //identificador
        elId = "" + timestamp;
        //recuperar datos del formulario
        pMaterial = $('#pmaterial').val();
        pTamano = $('#ptamaño').val();
        pCantidad = $('#pcantidad').val();
        pFechaEnt = $('#pfechaentrega').val();
        pFiles = $('#pfiles').val();
        pDescripcion = $('#pdescripcion').val();

        var storage = sessionStorage;

        // Guardar datos en sessionStorage
        storage.setItem('timestampS', timestamp);
        //Recuperar datos de sessionStorage
        email = storage.getItem('emailUsuario');


        //construyo el objeto de datos JSON

        var datospedido = {
            material: pMaterial,
            tamaño: pTamano,
            cantidad: pCantidad,
            fechaEntrega: pFechaEnt,
            files: pFiles,
            descripcion: pDescripcion,
            estado: estado,
            email: email
        }
        console.log(elId);
        colPedidos.doc(elId).set(datospedido)
            .then(function (ok) {
                console.log("Registro en BD OK!");
                console.log(email);
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Pedido Rezalizado!!',
                    showConfirmButton: false,
                    timer: 5000
                })
                location.href = 'panel-usuario.html';

            })
            .catch(function (e) { console.log("Error en BD" + e) })
    }

    //FUNCION PANEL ADMIN

    (function () {

        colUsuarios.where("rol", "==", "usuario")
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
                  
                        <img class="card-img-top" src="..." alt="Card image cap">
                        <div class="card-body">
                        <h5 class="card-title">${nombreUsuario} ${apellidoUsuario}</h5>                                                
                          
                          <p class="card-text">${paisUsuario}</p>
                          <p class="card-text">${emailUsuario}</p>
                          <p class="card-text">${fnacUsuario}</p>
                          <p class="card-text">${telefonoUsuario}</p>
                          </div>
                        
                          <a href="" id="login_btn">                            
                          <i class="fa fa-edit" aria-hidden="true"></i>                          
                      </a>
                      
                      </div>
                      
                      `;
                    $('#listaUsuarios').html(datosCard);
                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });

    })();

    //FUNCION VER PEDIDOS PANEL USUARIO

    (function () {

        var storage = sessionStorage;
        // Recuperar datos de sessionStorage
        email = storage.getItem('emailUsuario');

        colPedidos.where("estado", "==", "pendiente").where("email", "==", email)
            .get()
            .then((querySnapshot) => {
                datosCardPedidos = ``;
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    //console.log(doc.id, " => ", doc.data().nombre);

                    pMaterial = doc.data().material;
                    pTamano = doc.data().tamaño;
                    pCantidad = doc.data().cantidad;
                    pFechaEnt = doc.data().fechaEntrega;
                    pFiles = doc.data().files;
                    pDescripcion = doc.data().descripcion;
                    estado = doc.data().estado;
                    email = doc.data().email;
                    timestamp = doc.id;

                    datosCardPedidos = `
                    
                  <div class="card">
                  
                        <img class="card-img-top" src="..." alt="Card image cap">
                        <div class="card-body">
                        <h5 class="card-title">${pMaterial} ${pTamano}</h5>                                                
                          
                          <p class="card-text">${pCantidad}</p>
                          <p class="card-text">${pFechaEnt}</p>
                          <p class="card-text">${pFiles}</p>
                          <p class="card-text">${pDescripcion}</p>
                          <p class="card-text">${estado}</p>
                          <p class="card-text">${email}</p>
                          <p class="card-text">${timestamp}</p>
                          </div>                       
                      
                     
                      <a href="" type="button" data-toggle="modal" data-target="#myModal_${timestamp}">                           
                          <i class="fa fa-edit" aria-hidden="true"></i>                          
                      </a>  
                      
                      </div>
                      
                      `;
                    $('#listaPedidos').append(datosCardPedidos);

                    datosCardPedidos = `
                    <div class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" id="myModal_${timestamp}">
        
                    
                    <div class="modal-dialog">
                    <div class="modal-content">
    
                        <!-- Modal Header -->
                        <div class="modal-header">
                            <h4 class="modal-title">Pedido: ${timestamp}</h4>
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                        </div>
    
                        <!-- Modal body -->
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="recipient-name" class="col-form-label">Material:</label>
                                <input type="text" class="form-control" id="uMaterial${timestamp}" value="${pMaterial}">
                                <label for="recipient-name" class="col-form-label">Tamaño:</label>
                                <input type="text" class="form-control" id="uTamano${timestamp}" value="${pTamano}">
                                <label for="recipient-name" class="col-form-label">Cantidad:</label>
                                <input type="number" class="form-control" id="Ucantidad${timestamp}" value="${pCantidad}">
                                <label for="recipient-name" class="col-form-label">Fecha de Entrega:</label>
                                <input type="date" class="form-control" id="UFechaEnt${timestamp}" value="${pFechaEnt}" >
                                <label for="recipient-name" class="col-form-label">Imagenes producto:</label>
                                <input type="file" class="form-control" id="uFiles${timestamp}" value="${pFiles}">
                                <label for="recipient-name" class="col-form-label">Descripcion:</label>
                                <input type="text-area" class="form-control" id="uDescripcion${timestamp}" value="${pDescripcion}">
                            </div>
                        </div>
                        
                        <!-- Modal footer -->
                        <div class="modal-footer">
                            <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-success btnUpdateUser"  id="${timestamp}"> Update </button>   
                        </div>
                        
    
                    </div>
                </div>
                
                </div>  
                
                    `;
                    $('#modales').append(datosCardPedidos);
                    // $("btnUpdateUser").on()
                    /*  $('#btnUpdateUser').on('click', function(){
                          fnUpdateUser();
                          console.log("Entro en Actualizar");
                      });*/
                    $('.btnUpdateUser').on('click', function () {
                        fnUpdateUser(this.id)
                    });


                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });



    })();

    var uMaterial, uTamano, Ucantidad, UFechaEnt, uFiles, uDescripcion;
    //FUNCION ACTUALIZAR PEDIDO PANEL USUARIO
    function fnUpdateUser(elId) {

        console.log("Entro en Actualizar");

        var storage = sessionStorage;
        //Recuperar datos de sessionStorage
        timestamp = storage.getItem('timestampS');
        email = storage.getItem('emailUsuario');

        //identificador
        elId = "" + elId;

        //Recuperar datos de los inputs

        uMaterial = $('#uMaterial' + elId).val();
        uTamano = $('#uTamano' + elId).val();
        Ucantidad = $('#Ucantidad' + elId).val();
        UFechaEnt = $('#UFechaEnt' + elId).val();
        uFiles = $('#uFiles' + elId).val();
        uDescripcion = $('#uDescripcion' + elId).val();

        //Contruir objeto JSON

        var UpdPedido = {
            material: uMaterial,
            tamaño: uTamano,
            cantidad: Ucantidad,
            fechaEntrega: UFechaEnt,
            files: uFiles,
            descripcion: uDescripcion,
            email: email

        }
        console.log(elId);
        console.log(UpdPedido);
        //Actualizar datos en la base de datos
        colPedidos.doc(elId).update(UpdPedido)
            .then(function () {
                console.log("actualizado ok");
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Pedido Actualizado!!',
                    showConfirmButton: false,
                    timer: 5000
                })
                location.href = 'panel-usuario.html';

            })
            .catch(function (error) {

                console.log("Error: " + error);

            });
    }

    //FUNCION VER PEDIDOS PANEL ADMIN

    (function () {       

        colPedidos.get()
            .then((querySnapshot) => {
                datosTable = ``;
                querySnapshot.forEach((doc) => {

                    pMaterial = doc.data().material;
                    pTamano = doc.data().tamaño;
                    pCantidad = doc.data().cantidad;
                    pFechaEnt = doc.data().fechaEntrega;
                    pFiles = doc.data().files;
                    pDescripcion = doc.data().descripcion;
                    estado = doc.data().estado;
                    email = doc.data().email;
                    timestamp = doc.id;

                    datosTable = `                 

                        <tr>
                        <td>${timestamp}</td>
                        <td>${pMaterial}</td>
                        <td>${pTamano}</td>
                        <td>${pCantidad}</td>
                        <td>${pFechaEnt}</td>
                        <td>${pFiles}</td>
                        <td>${pDescripcion}</td>
                        <td>${estado}</td>
                        <td>${email}</td>  
                        <td><a href="" type="button" data-toggle="modal" data-target="#myModal_${timestamp}">                           
                        <i class="fa fa-edit" aria-hidden="true"></i>                          
                        </a></td>                  
                        </tr>
                 
                      `;
                    $('#tPedidos').append(datosTable);                    

                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });



    })();



});

