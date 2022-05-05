import React, { useState, useEffect } from "react";
import UserDataService from "../services/users";
import { Link } from "react-router-dom";

const UsersList = props => {
  const [users, setUsers] = useState([]);
  const [searchName, setSearchName ] = useState("");
  const [searchZip, setSearchZip ] = useState("");
  const [searchIdRol, setSearchIdRol ] = useState("");
  const [idRols, setIdRoles] = useState(["All IdRoles"]);

  useEffect(() => {
    retrieveUsers();
    retrieveIdRol();
  }, []);

  const onChangeSearchName = e => {
    const searchName = e.target.value;
    setSearchName(searchName);
  };

  const onChangeSearchZip = e => {
    const searchZip = e.target.value;
    setSearchZip(searchZip);
  };

  const onChangeSearchIdRol = e => {
    const searchIdRol = e.target.value;
    setSearchIdRol(searchIdRol);
    
  };

  const retrieveUsers = () => {
    UserDataService.getAll()
      .then(response => {
        console.log(response.data);
        setUsers(response.data.users);
        
      })
      .catch(e => {
        console.log(e);
      });
  };

  const retrieveIdRol = () => {
    UserDataService.getIdRol()
      .then(response => {
        console.log(response.data);
        setIdRoles(["All IdRoles"].concat(response.data));
        
      })
      .catch(e => {
        console.log(e);
      });
  };

  const refreshList = () => {
    retrieveUsers();
  };

  const find = (query, by) => {
    UserDataService.find(query, by)
      .then(response => {
        console.log(response.data);
        setUsers(response.data.users);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const findByName = () => {
    find(searchName, "Nombre")
  };

  const findByZip = () => {
    find(searchZip, "zipcode")
  };

  const findByIdRol = () => {
    if (searchIdRol == "All Role Ids") {
      refreshList();
    } else {
      find(searchIdRol, "idRol")
    }
  };

  return (
    <div>
      <div className="row pb-1">
        <div className="input-group col-lg-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name"
            value={searchName}
            onChange={onChangeSearchName}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByName}
            >
              Search
            </button>
          </div>
        </div>
        <div className="input-group col-lg-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by zip"
            value={searchZip}
            onChange={onChangeSearchZip}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByZip}
            >
              Search
            </button>
          </div>
        </div>
        <div className="input-group col-lg-4">

          <select onChange={onChangeSearchIdRol}>
             {idRols.map(idRol => {
               return (
                 <option value={idRol}> {idRol.substr(0, 20)} </option>
               )
             })}
          </select>
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByIdRol}
            >
              Search
            </button>
          </div>

        </div>
      </div>
      <div className="row">
        {users.map((user) => {
          const id = `${user._id}`;
          const name = `${user.Nombre}`;
          const Lastname = `${user.Apellido}`;
          const address = `${user.Direccion}`;
          return (
            <div className="col-lg-4 pb-1">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{user.Nombre}</h5>
                  <p className="card-text">
                    <strong>Id: </strong>{id}<br/>
                    <strong>name: </strong>{name}<br/>
                    <strong>Lastname: </strong>{Lastname}<br/>
                    <strong>Address: </strong>{address}
                  </p>
                  <div className="row">
                  <Link to={"/users/"+user._id} className="btn btn-primary col-lg-5 mx-1 mb-1">
                    View User
                  </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}


      </div>
    </div>
  );
};

export default UsersList;