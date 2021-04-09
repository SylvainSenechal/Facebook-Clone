import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

const App = props => {
  console.log('App props : ', props)

  const [user, setUser] = useState({
    pseudoLogin: "",
    passwordLogin: "",
    loggedIn: false,
    token: ""
  })

  console.log(user)

  return user.loggedIn
    ? <Dashboard user={user} setUser={setUser} />
    : <Login user={user} setUser={setUser} />
}

export default App;