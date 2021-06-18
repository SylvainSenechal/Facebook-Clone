import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

const App = props => {
  console.log('App props : ', props)

  const [user, setUser] = useState({
    loggedIn: false,
    token: ""
  })

  useEffect(() => {
    const token = window.localStorage.getItem('token')
    if (token !== '') {
      const tokenData64URL = token.split('.')[1]
      const tokenB64 = tokenData64URL.replace(/-/g, '+').replace(/_/g, '/')
      const tokenPayload = JSON.parse(atob(tokenB64))
      const { pseudo, userId, iat, exp } = tokenPayload
      if (Date.now() / 1000 < exp) {
        setUser({
          loggedIn: true,
          token: token
        })
      }
      else {
        console.log('token found but expired')
      }
    } else {
      console.log('empty local storage for token')
    }
  }, [])

  // if (window.location.href === "http://localhost:3000/") {
  //   return <Login user={user} setUser={setUser} />
  // }
  // if (window.location.href === "http://localhost:3000/dash") {
  //   return <Dashboard user={user} setUser={setUser} />
  // }
  return user.loggedIn
    ? <Dashboard user={user} setUser={setUser} />
    : <Login setUser={setUser} />
}

export default App;