import React, { useState, useEffect } from "react";
import UsersDataService from "../services/users";
import Cookies from "universal-cookie";
const cookies = new Cookies();

const MiPerfil = (props) => {
  const [perfil, setPerfil] = useState([]);
  const [perfilPicPath, setPerfilPic] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searchIdRol, setSearchIdRol] = useState("");
  const [idRols, setIdRoles] = useState(["All IdRoles"]);


  useEffect(() => {
    getPerfil();
  }, []);

  //   const onChangeSearchId = e => {
  //     const searchId = e.target.value;
  //     setSearchId(searchId);
  //   };

  //   const onChangeSearchName = e => {
  //     const searchName = e.target.value;
  //     setSearchName(searchName);
  //   };

  //   const onChangeSearchIdRol = e => {
  //     const searchIdRol = e.target.value;
  //     setSearchIdRol(searchIdRol);
  //   };

    const getPerfil = async () => {

      const _id = cookies.get("_id");
      
      await UsersDataService.get(_id)
        .then(response => {
          console.log(response.data.users[0]);
          setPerfil(response.data.users[0]);
          // const path = ('../assets/profilePics/' + perfil.profilePic);
          // const path = ('../assets/profilePics/' + 'avatar7.png');
          // console.log('Path  before: ', path);
          // setPerfilPic(path);

        })
        .catch(e => {
          console.log(e);
        });
    };

  //   const retrieveIdRol = () => {
  //     UserDataService.getIdRol()
  //       .then(response => {
  //         console.log('Resultados: ', response.data);
  //         setIdRoles(["All IdRoles"].concat(response.data));

  //       })
  //       .catch(e => {
  //         console.log(e);
  //       });
  //   };

  //   const refreshList = () => {
  //     retrieveUsers();
  //   };

  //   const find = (query, by) => {
  //     UserDataService.find(query, by)
  //       .then(response => {
  //         console.log(response.data);
  //         setUsers(response.data.users);
  //       })
  //       .catch(e => {
  //         console.log(e);
  //       });
  //   };

  //   const findByName = () => {
  //     find(searchName, "Nombre")
  //   };

  //   const findById = () => {
  //     find(searchId, "_id")
  //   };

  //   const findByIdRol = () => {
  //     if (searchIdRol === "All IdRoles") {
  //       refreshList();
  //     } else {
  //       find(searchIdRol, "IdRol")
  //     }
  //   };
  if (cookies.get("_id")) {
    return (
      <div>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 mb-4 mb-sm-5">
              <div className="card card-style1 border-0">
                <div className="card-body p-1-9 p-sm-2-3 p-md-6 p-lg-7">
                  <div className="row align-items-center">
                    <div className="col-lg-6 mb-4 mb-lg-0">
                      {/* <img src={require('../assets/profilePics/' + perfil.profilePic)} alt="..."></img> */}
                      <img src={require('../assets/profilePics/avatar7.png')} alt="..."></img>
                    </div>
                    <div className="col-lg-6 px-xl-10">
                      <div className="d-lg-inline-block py-1-9 px-1-9 px-sm-6 mb-1-9 rounded">
                        <h3 className="h2 text-black mb-0">{perfil.nombre} {perfil.apellido}</h3>
                      </div>
                      <ul className="list-unstyled mb-1-9">
                        <li className="mb-2 mb-xl-3 display-28">
                          <span className="display-26 text-secondary me-2 font-weight-600">
                            Dirección:
                          </span>
                          { perfil.direccion }
                        </li>
                        <li className="mb-2 mb-xl-3 display-28">
                          <span className="display-26 text-secondary me-2 font-weight-600">
                            Telefono:
                          </span>{" "}
                          { perfil.telefono }
                        </li>
                        <li className="mb-2 mb-xl-3 display-28">
                          <span className="display-26 text-secondary me-2 font-weight-600">
                            Email:
                          </span>{" "}
                          { perfil.correoE }
                        </li>
                        <li className="mb-2 mb-xl-3 display-28">
                          <span className="display-26 text-secondary me-2 font-weight-600">
                            DNI:
                          </span>{" "}
                          { perfil.dni }
                        </li>
                        <li className="display-28">
                          <span className="display-26 text-secondary me-2 font-weight-600">
                            Fecha de nacimiento:
                          </span>{" "}
                          { perfil.fechaNac }
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12 mb-4 mb-sm-5">
              <div>
                <span className="section-title text-primary mb-3 mb-sm-4">
                  About Me
                </span>
                <p>
                  Edith is simply dummy text of the printing and typesetting
                  industry. Lorem Ipsum has been the industry's standard dummy
                  text ever since the 1500s, when an unknown printer took a
                  galley of type and scrambled it to make a type specimen book.
                </p>
                <p className="mb-0">
                  It is a long established fact that a reader will be distracted
                  by the readable content of a page when looking at its layout.
                  The point of using Lorem Ipsum is that it has a more-or-less
                  normal distribution of letters, as opposed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    window.location.href = "./login";
    console.log("Necesita logearse para poder acceder al ABM de usuarios");
  }
};

export default MiPerfil;
