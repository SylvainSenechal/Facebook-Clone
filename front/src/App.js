import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

const App = props => {
  console.log('App props : ', props)

  const [user, setUser] = useState({
    loggedIn: false,
    keepConnected: false,
    token: "",
    refreshToken: ""
  })

  console.log(user)

  useEffect(() => { // This is only to restore the "keep me connected" session
    const restoreSession = async () => {
      const refreshToken = window.localStorage.getItem('refreshToken')
      if (refreshToken !== '' && refreshToken !== null) {
        const tokenData64URL = refreshToken.split('.')[1]
        const tokenB64 = tokenData64URL.replace(/-/g, '+').replace(/_/g, '/')
        const tokenPayload = JSON.parse(atob(tokenB64))
        const { pseudo, userId, iat, exp } = tokenPayload
        if (Date.now() / 1000  + 5 < exp) { // 5 secs of margin 
          const result = await fetch(`http://localhost:8080/newToken/${refreshToken}`, { // todo check error on this
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
              'Content-Type': 'application/json',
            },
          })
          const readableResult = await result.json()
          setUser({
            loggedIn: true,
            keepConnected: true,
            token: readableResult.newToken,
            refreshToken: refreshToken
          })
        }
        else {
          console.log('refreshToken found but expired')
        }
      } else {
        console.log('empty local storage for token')
      }
    }
    restoreSession()
  }, [])

  //todo : refresh le refresh token ?

  useEffect(() => { // This will check for refreshing the current token if outdated, 
    const fetchData = async () => {
      const result = await fetch(`http://localhost:8080/newToken/${user.refreshToken}`, { // todo check error on this
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const readableResult = await result.json()
      setUser({
        loggedIn: true,
        keepConnected: true, // attention à ce keepconnected
        token: readableResult.newToken,
        refreshToken: user.refreshToken   //todo : refresh le refresh token ?
      })
    }

    const timer = setInterval(() => {
      if (user.token !== "") { // If not logged in, we got nothing to refresh
        const tokenData64URL = user.token.split('.')[1]
        const tokenB64 = tokenData64URL.replace(/-/g, '+').replace(/_/g, '/')
        const tokenPayload = JSON.parse(atob(tokenB64))
        const { pseudo, userId, iat, exp } = tokenPayload
        const margin = 5 // We refresh the token x seconds before it actually expires
        console.log(Date.now() / 1000 + margin - exp)
        if (Date.now() / 1000 + margin - exp > 0) { // If token is soon to be expired; we ask a new one
          fetchData()
        }
      }
    }, 1000)

    return () => clearTimeout(timer);
  }, [user])

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