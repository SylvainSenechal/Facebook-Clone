import { useState } from 'react';
import Footer from './Footer'

const Login = ({ user, setUser }) => {
  console.log('Login props : ', user)

  const [pseudoRegister, setPseudoRegister] = useState("My Pseudo")
  const [passwordRegister, setPasswordRegister] = useState("My Password")
  const [messageRegister, setMessageRegister] = useState("")

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
      body: JSON.stringify({ pseudo: user.pseudoLogin, password: user.passwordLogin })
    })
    const readableResult = await result.json()
    if (readableResult.message === "Authentication successful") {
      setUser(prev => ({ ...prev, token: readableResult.token, loggedIn: true }))
    }
  }

  return (
    <div className="LoginPage">
      <div className="formsLoginRegister" >
        <div className="logInfo" style={{ "--order": 0 }}>
          <p> Register </p>
          <form onSubmit={handleSubmitRegistration}>
            <label htmlFor="pseudo"> Enter your name:
            <input type="text" name="pseudo" id="pseudo" value={pseudoRegister} onChange={e => setPseudoRegister(e.target.value)} required />
            </label>
            <label htmlFor="password"> Enter your password:
            <input type="password" name="password" id="password" value={passwordRegister} onChange={e => setPasswordRegister(e.target.value)} required />
            </label>
            <input type="submit" value="Register" />
          </form>
          <div> {messageRegister} </div>
          <div className="borderLine" />
        </div>

        <div className="logInfo" style={{ "--order": 1 }}>
          <p> Login </p>
          <form onSubmit={handleSubmitLogin}>
            <label htmlFor="pseudo"> Enter your name:
            <input type="text" name="pseudo" id="pseudo" value={user.pseudoLogin}
                onChange={e => setUser(prev => ({ ...prev, pseudoLogin: e.target.value }))} required
              />
            </label>
            <label htmlFor="password"> Enter your password:
            <input type="password" name="password" id="password" value={user.passwordLogin}
                onChange={e => setUser(prev => ({ ...prev, passwordLogin: e.target.value }))} required
              />
            </label>
            <input type="submit" value="Register" />
          </form>
          <div className="borderLine" />
        </div>
      </div>
      < Footer />
    </div>
  )
}

export default Login;