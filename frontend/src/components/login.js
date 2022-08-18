import React, { useState } from "react";
import UsersDataService from "../services/users";
import { Alert } from "reactstrap";
import Cookies from 'universal-cookie'

const cookies = new Cookies();

function Login() {
  const [user, setUser] = useState({
    correoE: "",
    password: "",
  });
  const [validationErrorMessage, setValidationErrorMessage] = useState("");


  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log(user);
  };

  //      const deleteCar = async (carId) => {
  //        console.log("Car to be deleted", carId);
  //        await CarsDataService.deleteCar(carId)
  //          .then((response) => {
  //            refreshList();
  //          })
  //          .catch((e) => {
  //            console.log(e);
  //          });
  //      };

  const iniciarSesion = async (user) => {
    const result = await UsersDataService.getLogin(user.correoE, user.password)
    if (result.data.status ){
      setValidationErrorMessage('');

      cookies.set('_id', result.data.responseData._id, {path: "/"});
      cookies.set('nombre', result.data.responseData.nombre, {path: "/"});
      cookies.set('apellido', result.data.responseData.apellido, {path: "/"});
      console.log('Usuario y contraseña correctos', );
      window.location.href="./cars"
    }else{
      setValidationErrorMessage(result?.data.errorMessage);

      console.log('Error, el usuario y/o contraseña son incorrectos');
    };
  };

  const buildErrorMessage = () => {
    if (validationErrorMessage !== '') {
      return (
        <Alert id='errorMessage' className="alert alert-danger fade show" key='danger' variant='danger'>
          {validationErrorMessage}
        </Alert>
      );
    }
    return;
  }

  return (
    <div className="App">
      <label>Usuario: </label>
      <br />
      <input
        type="text"
        className="form-control"
        name="correoE"
        onChange={handleChange}
      />
      <br />
      <label>Contraseña: </label>
      <br />
      <input
        type="password"
        className="form-control"
        name="password"
        onChange={handleChange}
      />
      <br />
      <button className="btn btn-primary" onClick={() => iniciarSesion(user)}>
        Iniciar Sesión
      </button>
      {buildErrorMessage()}
    </div>
  );
}

export default Login;
