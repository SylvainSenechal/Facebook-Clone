import { useState } from 'react';
import Footer from './Footer'

const Login = ({ setUser }) => {
  const [pseudoRegister, setPseudoRegister] = useState("My Pseudo")
  const [passwordRegister, setPasswordRegister] = useState("")
  const [pseudoLogin, setPseudoLogin] = useState("")
  const [passwordLogin, setPasswordLogin] = useState("")
  const [messageRegister, setMessageRegister] = useState("")
  const [keepConnected, setKeepConnected] = useState(false)

  const handleSubmitRegistration = async event => {
    event.preventDefault()

    const result = await fetch('http://localhost:8080/register', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo: pseudoRegister, password: passwordRegister })
    })
    const readableResult = await result.json()
    setMessageRegister(readableResult.message)
  }

  const handleSubmitLogin = async event => {
    event.preventDefault()

    const result = await fetch('http://localhost:8080/login', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo: pseudoLogin, password: passwordLogin })
    })
    const readableResult = await result.json()
    if (readableResult.message === "Authentication successful") {
      setUser(prev => ({ ...prev, token: readableResult.token, refreshToken: readableResult.refreshToken, loggedIn: true, keepConnected: keepConnected }))
      if (keepConnected) {
        window.localStorage.setItem('refreshToken', readableResult.refreshToken)
      } else {
        window.sessionStorage.setItem('refreshToken', readableResult.refreshToken)
      }
      console.log(window.localStorage)
      console.log(window.sessionStorage)
    }
  }

  return (
    <div className="LoginPage">
      <div className="formsLoginRegister" >
        <div className="logInfo" style={{ "--order": 0 }}>
          <p className="borderLine"> Register </p>
          <form onSubmit={handleSubmitRegistration}>
            <label htmlFor="pseudo"> Enter your name: </label>
            <input type="text" name="pseudo" id="pseudoRegister" value={pseudoRegister} onChange={e => setPseudoRegister(e.target.value)} required />
            <label htmlFor="password"> Enter your password: </label>
            <input type="password" name="password" id="passwordRegister" value={passwordRegister} onChange={e => setPasswordRegister(e.target.value)} required />
            <input type="submit" value="Register" />
          </form>
          <div> {messageRegister} </div>
        </div>

        <div className="logInfo" style={{ "--order": 1 }}>
          <p className="borderLine"> Login </p>
          <form onSubmit={handleSubmitLogin}>
            <label htmlFor="pseudo"> Enter your name: </label>
            <input type="text" name="pseudo" id="pseudoLoginh" value={pseudoLogin} onChange={e => setPseudoLogin(e.target.value)} required />
            <label htmlFor="password"> Enter your password: </label>
            <input type="password" name="password" id="passwordLogin" value={passwordLogin} onChange={e => setPasswordLogin(e.target.value)} required />
            <label htmlFor="keepConnectede"> Keep me connected :</label>
            <input
              name="keepConnected"
              type="checkbox"
              checked={keepConnected}
              onChange={e => setKeepConnected(e.target.checked)}
            />
            <input type="submit" value="Register" />
          </form>
        </div>
      </div>
      < Footer />
    </div>
  )
}

export default Login;