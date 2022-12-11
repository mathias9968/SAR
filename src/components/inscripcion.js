/* eslint-disable react/jsx-key */
import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalFooter, Alert } from 'reactstrap';
import InscripcionDataService from '../services/inscripcion';
import CarsDataService from '../services/cars';
import 'bootstrap/dist/css/bootstrap.min.css';
import Cookies from 'universal-cookie';
import QRcode from 'qrcode';
const cookies = new Cookies();

const CarsList = () => {
	const defaultInsc = {
		carreraId: '',
		claseId: '',
		idUsuario: cookies.get('_id'),
		vehiculoSeleccionado: '',
		fechaSprint: '',
	};

	const [eventosDisponibles, setEventosDisponibles] = useState([]);
	const [clasesDisponibles, setClasesDisponibles] = useState(['Seleccionar Clase']);
	const [eventoSeleccionada, setEventoSeleccionada] = useState([]);
	const [autos, setAutos] = useState([]);
	const [inscripcion, setInscripcion] = useState(defaultInsc);
	const [inscribrOtroCompetidor, setInscribirOtroCompetidor] = useState(true);
	const [modalCodigoQR, setModalCodigoQR] = useState(false);
	const [modalErrorDatos, setModalErrorDatos] = useState(false);
	const [validationErrorMessage, setValidationErrorMessage] = useState('');
	const [qrcode, setQrCode] = useState('');

	useEffect(() => {
		retrieveEventos();
		getAutos();
		document.getElementById('buscarVehiculsButton').disabled = true;
	}, []);

	const onChangesetSelectedClass = (e) => {
		const clase = e.target.value;
		console.log('Eventos Disponibles: ', eventosDisponibles);

		const eventoData = eventosDisponibles.find((evento) => evento.carreraNombreClase === clase);
		console.log('Evento Seleccionada: ', eventoData);
		const fechaSprint = eventoData.fecha.split('T')[0];

		if (eventoData) {
			setEventoSeleccionada(eventoData);
			setInscripcion((prevState) => ({
				...prevState,
				carreraId: eventoData.carreraId,
				claseId: eventoData.carreraIdClase,
				fechaSprint: fechaSprint,
			}));
		}
		document.getElementById('tiempoClaseData').value = eventoData.tiempoClase;
	};

	// function onChangeValue(event) {
	// 	// console.log(`Name: ${event.target.name} Value: ${event.target.value}`);
	// 	const { name, value } = event.target;
	// 	setInscripcion((prevState) => ({
	// 		...prevState,
	// 		[name]: value,
	// 	}));
	// }

	function onChangeValueCompetidor() {
		setInscribirOtroCompetidor((prevState) => !prevState);
		document.getElementById('otroCompetidorData').setAttribute('required', inscribrOtroCompetidor);
		if (inscribrOtroCompetidor) {
			vaciarVehiculoSeleccionado();
			setAutos([]);
			alert('Necesita seleccionar el boton "Buscar Vehiculos" para seleccionar un vehiculo antes de finalizar la inscripcion');
			document.getElementById('buscarVehiculsButton').setAttribute('class', 'btn btn-primary');
			document.getElementById('buscarVehiculsButton').disabled = false;
		} else {
			vaciarVehiculoSeleccionado();
			document.getElementById('buscarVehiculsButton').disabled = true;
			document.getElementById('buscarVehiculsButton').setAttribute('class', 'btn btn-secondary');
			getAutos();
		}
	}

	function vaciarVehiculoSeleccionado() {
		setInscripcion((prevState) => ({
			...prevState,
			vehiculoSeleccionado: '',
		}));
		document.getElementById('carData').value = '';
		document.getElementById('otroCompetidorData').value = '';
	}

	const getAutos = async () => {
		const _id = cookies.get('_id');

		await CarsDataService.find(_id, 'idUsuarioDuenio')
			.then((response) => {
				console.log('autos tiene', response.data.cars);
				setAutos(response.data.cars);
			})
			.catch((e) => {
				console.log(e);
			});
	};

	const selectCar = (car = {}) => {
		console.log('Selected: ', car);
		setInscripcion((prevState) => ({
			...prevState,
			vehiculoSeleccionado: car._id,
		}));
		const carData = `${car.modelo} - ${car.patente} - ${car.anio}`;
		document.getElementById('carData').value = carData;
	};

	const retrieveEventos = async () => {
		const response = await InscripcionDataService.getAvailable();

		console.log('Data: ', response.data.eventosDisponibles);
		const clasesDisponiblesList = response.data.eventosDisponibles.map((evento) => {
			return evento.carreraNombreClase;
		});
		setEventosDisponibles(response.data.eventosDisponibles);

		ordenarClases(clasesDisponiblesList);
		console.log('Clases Detectadas: ', clasesDisponiblesList);

		setClasesDisponibles(['Seleccionar Clase'].concat(clasesDisponiblesList));
	};

	function ordenarClases(clasesDisponiblesList) {
		clasesDisponiblesList.sort((claseA, claseB) => {
			const nameA = claseA.toUpperCase(); // Para ignorar mayusculas y minusculas en la comparacion
			const nameB = claseB.toUpperCase();
			if (nameA < nameB) return -1;
			if (nameA > nameB) return 1;

			// Nombres iguales
			return 0;
		});
	}

	async function buscarVehiculosCompetidor() {
		if (!inscribrOtroCompetidor) {
			const competidorId = document.getElementById('otroCompetidorData').value;
			if (competidorId) {
				console.log('Buscando autos para el competidor: ', competidorId);
				await CarsDataService.find(competidorId, 'idUsuarioDuenio')
					.then((response) => {
						console.log('autos tiene', response.data.cars);
						if (!response.data.cars.length) {
							alert('Por favor ingrese el Id de un usuario existente y vuelva a buscar sus vehiculos');
						}
						setAutos(response.data.cars);
					})
					.catch((e) => {
						console.log(e);
					});
			} else {
				alert('Por favor ingrese el Id de un usuario existente y vuelva a buscar sus vehiculos');
			}
		}
	}

	function cambiarIdUsuarioInscripcion(userId) {
		const newInscripcion = inscripcion;
		newInscripcion.idUsuario = userId;
		setInscripcion(newInscripcion);
	}

	// Generador de codigo QR
	function generateQrCode() {
		const message = `Usuario ${inscripcion.idUsuario} abonado`;
		QRcode.toDataURL(message, (err, message) => {
			if (err) return console.error(err);

			console.log(message);
			setQrCode(message);
		});
	}

	async function enviarInscripcion() {
		// False implica usar ID del OTRO competidor y no del user logeado
		if (!inscribrOtroCompetidor) {
			const competidorId = document.getElementById('otroCompetidorData').value;
			cambiarIdUsuarioInscripcion(competidorId);
		} else if (inscripcion.idUsuario !== cookies.get('_id')) {
			cambiarIdUsuarioInscripcion(cookies.get('_id'));
		}

		const result = await InscripcionDataService.createInscripcion(inscripcion);
		// Testing purposes
		// const result = {status:200}
		// const result = { errorMessage: 'Datos erroneos' }
		if (result.status) {
			console.log('Inscripcion exitosa');
			setInscripcion(defaultInsc);
			generateQrCode();
			setModalCodigoQR(true);
		} else {
			setModalErrorDatos(true);
			setValidationErrorMessage(result?.errorMessage);
		}
	}

	const closeModalCodigoQR = () => {
		setModalCodigoQR(false);
		window.location.reload(false);
	};

	const closeModalErrorDatos = () => {
		setModalErrorDatos(false);
		setValidationErrorMessage('');
	};

	const buildErrorMessage = () => {
		if (validationErrorMessage !== '') {
			return (
				<Alert id="errorMessage" className="alert alert-danger fade show" key="danger" variant="danger">
					{validationErrorMessage}
				</Alert>
			);
		}
		return;
	};

	// Funcion de custom validation basada en la documentacion de Bootstrap
	(function () {
		// TODO: Revisar si esto de use strict al sacarlo cambia algo en esta pantalla o no
		'use strict';
		// Obtiene todos los formularios a los que queremos aplicarles la validacion custom
		var forms = document.querySelectorAll('.needs-validation');

		// Loopeamos a traves de los campos a ser validados y los marcamos segun apliquen
		Array.prototype.slice.call(forms).forEach(function (form) {
			form.addEventListener(
				'submit',
				function (event) {
					if (!form.checkValidity()) {
						event.preventDefault();
						event.stopPropagation();
					}

					form.classList.add('was-validated');
				},
				false
			);
		});
	})();

	function formPreventDefault(e) {
		alert('Inscripcion enviada');
		e.preventDefault();
	}

	if (cookies.get('_id')) {
		return (
			<div className="align-self-center">
				<div className="container-lg align-self-center">
					<form className="container-fluid align-self-center needs-validation" onSubmit={formPreventDefault} noValidate>
						<p className="h1 text-center">Inscripcion a Evento</p>
						<div className="form-row">
							<div className="form-group align-items-center col-md-6">
								<label className="label-class" htmlFor="exampleInputEmail1">
									Clases disponibles para este viernes
								</label>
								<select onChange={onChangesetSelectedClass}>
									{clasesDisponibles.map((param) => {
										return (
											<option key={param} value={param}>
												{' '}
												{param}{' '}
											</option>
										);
									})}
								</select>
								<br></br>
								<label className="label-class" htmlFor="cuposClase">
									{eventoSeleccionada.aproxCupos}
								</label>
								<br></br>
								<label className="label-class" htmlFor="tiempoClase">
									{' '}
									Tiempo de la clase seleccionada:{' '}
								</label>
								<input type="text" id="tiempoClaseData" name="tiempoDataInput" className="col-md-1" data-readonly required />
								<div className="invalid-feedback">Por favor seleccione una clase de la lista.</div>
							</div>
							<hr className="rounded"></hr>
							<div className="form-group align-items-center form-check">
								<label className="font-weight-bold" htmlFor="inscripcionOtroCompetidorLabel">
									{' '}
									Deseo inscribir a otro competidor:{' '}
								</label>
								<br></br>
								<div onChange={onChangeValueCompetidor}>
									<input className="radio-class-competidor" type="radio" value="false" name="inscribirOtroCompetidor" defaultChecked /> No
									<br></br>
									<input className="radio-class-competidor" type="radio" value="true" name="inscribirOtroCompetidor" /> Si
								</div>
							</div>
							<div className="form-group align-items-center form-check">
								<div className="form-group align-items-center">
									<label className="label-class" htmlFor="idCompetidor">
										{' '}
										Id del competidor:{' '}
									</label>
									<input type="text" id="otroCompetidorData" name="otroCompetidorDataInput" className="col-md-3" readOnly={inscribrOtroCompetidor} />
									<div className="invalid-feedback">Por favor ingrese el ID de un competidor.</div>
									<button className="btn btn-secondary" id="buscarVehiculsButton" type="button" onClick={buscarVehiculosCompetidor}>
										Buscar Vehiculos
									</button>
								</div>
							</div>
							<hr className="rounded"></hr>
							<div>
								<div className="container-xl">
									<div className="table-responsive">
										<div className="table-wrapper">
											<div className="table-title">
												<div className="row">
													<div className="col-sm-6">
														<h2>Selecciona el auto con el que vas a correr</h2>
													</div>
												</div>
											</div>
											<table className="table table-striped w-auto table-hover">
												<thead>
													<tr>
														<th>Id</th>
														<th>Patente</th>
														<th>Modelo</th>
														<th>Año</th>
														<th>Agregados</th>
														<th>Historia</th>
														<th>Workshop Asociado</th>
														<th>Id Dueño</th>
														<th>Acciones</th>
													</tr>
												</thead>
												<tbody>
													{autos.map((selectedCar) => {
														const id = `${selectedCar._id}`;
														const patente = `${selectedCar.patente}`;
														const modelo = `${selectedCar.modelo}`;
														const anio = `${selectedCar.anio}`;
														const agregados = `${selectedCar.agregados}`;
														const historia = `${selectedCar.historia}`;
														const tallerAsociado = `${selectedCar.tallerAsociado}`;
														const idUsuarioDuenio = `${selectedCar.idUsuarioDuenio}`;
														return (
															<tr>
																<td>{id}</td>
																<td>{patente}</td>
																<td>{modelo}</td>
																<td>{anio}</td>
																<td>{agregados}</td>
																<td width="">{historia}</td>
																<td>{tallerAsociado}</td>
																<td>{idUsuarioDuenio}</td>
																<td>
																	<button className="btn btn-primary" type="button" onClick={() => selectCar(selectedCar)}>
																		Seleccionar
																	</button>
																</td>
															</tr>
														);
													})}
												</tbody>
											</table>
										</div>
									</div>
								</div>
								<br></br>
								<div className="form-group align-items-center">
									<label className="label-class" htmlFor="tiempoClase">
										{' '}
										Vehiculo Seleccionado:{' '}
									</label>
									<input type="text" id="carData" name="carDataInput" className="col-md-3" data-readonly required />
									<div className="invalid-feedback">Por favor seleccione uno de sus vehiculos en la tabla.</div>
								</div>
							</div>
							<hr className="rounded"></hr>
							<div className="form-group align-items-center form-check">
								<label className="font-weight-bold" htmlFor="tiempoClase">
									{' '}
									Precio de la inscripcion: {eventoSeleccionada.precio}
								</label>
								<br></br>
							</div>
							<hr className="rounded"></hr>
							<button className="btn btn-primary col-md-3" onClick={enviarInscripcion}>
								Inscribirse
							</button>
						</div>
					</form>
				</div>
				<Modal isOpen={modalCodigoQR}>
					<ModalBody>
						<p className="h1 text-center">Gracias por inscribirse</p>
						<label>Con el siguiente codigo QR, usted podra ingresar al predio por la entrada preferencial y abonar en efectivo:</label>
						{qrcode && (
							<>
								<img src={qrcode} />
								<a href={qrcode} download="qrcode.png">
									Download
								</a>
							</>
						)}
					</ModalBody>
					<ModalFooter>
						<button className="btn btn-success" onClick={() => closeModalCodigoQR()}>
							Cerrar
						</button>
					</ModalFooter>
				</Modal>

				<Modal isOpen={modalErrorDatos}>
					<ModalBody>
						<p className="h1 text-center">Hay un error en los datos ingresados</p>
						<label>Por favor corregir el error para continuar:</label>
						{buildErrorMessage()}
					</ModalBody>
					<ModalFooter>
						<button className="btn btn-secondary" onClick={() => closeModalErrorDatos()}>
							Cerrar
						</button>
					</ModalFooter>
				</Modal>
			</div>
		);
	} else {
		window.location.href = './errorPage';
		console.log('Necesita logearse y tener los permisos suficientes para poder acceder a esta pantalla');
		<Alert id="errorMessage" className="alert alert-danger fade show" key="danger" variant="danger">
			Necesita logearse y tener los permisos suficientes para poder acceder a esta pantalla
		</Alert>;
	}
};

export default CarsList;
