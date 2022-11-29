import React, { useState, useEffect } from 'react';
import LoginDataService from '../services/login';
import UserDataService from '../services/users';
import { Modal, ModalBody, ModalFooter, Alert } from 'reactstrap';
import Cookies from 'universal-cookie';
import '../styles/login.css';

const cookies = new Cookies();

function Login() {
	const [user, setUser] = useState({
		correoE: '',
		password: '',
	});
	const [validationErrorMessage, setValidationErrorMessage] = useState('');

	const [modalCrear, setModalCrear] = useState(false);
	const [genero, setGeneros] = useState(['Seleccionar Genero']);

	useEffect(() => {
		retrieveGeneros();
	}, []);

	const [selectedUser, setSelectedUser] = useState({
		_id: '',
		apellido: '',
		correoE: '',
		direccion: '',
		dni: '',
		fechaNac: '',
		idRol: '2',
		idSector: '2',
		genero: '',
		idVehiculo: '',
		nombre: '',
		password: '',
		telefono: '',
	});

	const selectUser = (selectedUser = {}) => {
		console.log('Selected: ', selectedUser);
		setSelectedUser(selectedUser);
		setModalCrear(true);
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setUser((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleChangeCreate = (e) => {
		const { name, value } = e.target;
		setSelectedUser((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const retrieveGeneros = async () => {
		await UserDataService.getAllGen()
			.then((response) => {
				console.log('Data: ', response.data);
				setGeneros(['Seleccionar Genero'].concat(response.data));
			})
			.catch((e) => {
				console.log(e);
			});
	};

	const logIn = async (user) => {
		const result = await LoginDataService.get(user.correoE, user.password);
		console.log('con esto te intentas logear ', result);
		if (result.data.status) {
			setValidationErrorMessage('');

			cookies.set('_id', result.data.responseData._id, { path: '/' });
			cookies.set('nombre', result.data.responseData.nombre, { path: '/' });
			cookies.set('apellido', result.data.responseData.apellido, { path: '/' });
			cookies.set('idRol', result.data.responseData.idRol, { path: '/' });
			cookies.set('direccion', result.data.responseData.direccion, { path: '/' });
			cookies.set('correoE', result.data.responseData.correoE, { path: '/' });
			cookies.set('dni', result.data.responseData.dni, { path: '/' });
			cookies.set('fechaNac', result.data.responseData.fechaNac, { path: '/' });
			cookies.set('telefono', result.data.responseData.telefono, { path: '/' });
			window.location.href = './Inicio';
		} else {
			setValidationErrorMessage(result?.data?.errorMessage);
		}
	};

	const crear = async (selectedUser) => {
		setSelectedUser(selectedUser);
		console.log('selected user contiene:' + selectedUser);
		const result = await UserDataService.createUser(selectedUser);
		if (result?.status) {
			console.log('creación exitosa');
			setValidationErrorMessage('');
			setModalCrear(false);
			logIn(selectedUser);
		} else {
			setValidationErrorMessage(result?.errorMessage);
		}
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

	return (
		<div className="App">
			<div className="text-center">
				<div className="form-signin">
					<h1 className="h3 mb-3 font-weight-normal">Por favor, ingresa</h1>
					<label className="sr-only">Usuario</label>
					<input type="text" className="form-control" name="correoE" onChange={handleChange} />
					<label className="sr-only">Contraseña</label>
					<input type="password" className="form-control" name="password" onChange={handleChange} />{' '}
					<div className="checkbox mb-3">
						<label></label>
					</div>
					<button className="btn btn-primary" onClick={() => logIn(user)}>
						Iniciar Sesión
					</button>
					<br></br>
					<br></br>
					<button className="btn btn-primary" onClick={() => selectUser(selectedUser)}>
						Registrarse
					</button>
					{buildErrorMessage()}
				</div>
			</div>

			<Modal isOpen={modalCrear}>
				<ModalBody>
					<input className="form-control" readOnly type="text" name="id" id="idField" value={selectedUser._id} placeholder="Auto-Incremental ID" />
					<label>Nombre</label>
					<input className="form-control" type="text" maxLength="300" name="nombre" id="nombreField" onChange={handleChangeCreate} value={selectedUser.nombre} />
					<label>Apellido</label>
					<input className="form-control" type="text" maxLength="50" name="apellido" id="apellidoField" onChange={handleChangeCreate} value={selectedUser.apellido} />
					<label>CorreoE</label>
					<input className="form-control" type="text" maxLength="100" name="correoE" id="correoEField" onChange={handleChangeCreate} value={selectedUser.correoE} />
					<label>Dirección</label>
					<input className="form-control" type="text" maxLength="100" name="direccion" id="direccionField" onChange={handleChangeCreate} value={selectedUser.direccion} />
					<label>DNI</label>
					<input className="form-control" type="number" maxLength="10" name="dni" id="dniField" onChange={handleChangeCreate} value={selectedUser.dni} />
					<label>Fecha de Nacimiento</label>
					<input className="form-control" type="date" maxLength="300" name="fechaNac" id="fechaNacField" onChange={handleChangeCreate} value={selectedUser.fechaNac} />
					<label>Genero</label>
					<select className="form-select" name="genero" id="generoField" onChange={handleChangeCreate} value={selectedUser.genero} aria-label="Default select example">
						{genero.map((genero) => {
							const nombre = `${genero}`;
							return (
								<option key={nombre} value={nombre}>
									{nombre}
								</option>
							);
						})}
					</select>
					<label>Password</label>
					<input
						className="form-control"
						type="password"
						maxLength="200"
						name="password"
						id="passwordField"
						onChange={handleChangeCreate}
						value={selectedUser.password}
					/>
					<label>Telefono</label>
					<input className="form-control" type="number" maxLength="50" name="telefono" id="telefonoField" onChange={handleChangeCreate} value={selectedUser.telefono} />
				</ModalBody>
				<ModalFooter>
					{buildErrorMessage()}
					<button className="btn btn-secondary" onClick={() => crear(selectedUser)}>
						Crear
					</button>
					<button className="btn btn-secondary" onClick={() => setModalCrear(false)}>
						Cancelar
					</button>
				</ModalFooter>
			</Modal>
		</div>
	);
}

export default Login;
