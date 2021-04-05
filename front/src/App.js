import { useState, useEffect } from 'react';

const App = props => {
  console.log(props)

  const [pseudoRegister, setPseudoRegister] = useState("My Pseudo")
  const [passwordRegister, setPasswordRegister] = useState("My Password")

  const [isLogged, setIsLogged] = useState(false)

  const handleSubmitRegistration = async event => {
    event.preventDefault()
    console.log('ok')
    console.log(pseudoRegister)
    console.log(passwordRegister)
    let result = await fetch('http://localhost:8080/register', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({pseudo: pseudoRegister, password: passwordRegister})
    })
    let readableResult = await result.json()
    console.log(readableResult)
  }
  
  return (
    <>
      <div className="App">
        <p> Register </p>
        <form  onSubmit={handleSubmitRegistration}>
          <label htmlFor="pseudo"> Enter your name: 
            <input type="text" name="pseudo" id="pseudo" value={pseudoRegister} onChange={e => setPseudoRegister(e.target.value)} required />
          </label>
          <label htmlFor="password"> Enter your email:
            <input type="password" name="password" id="password" value={passwordRegister} onChange={e => setPasswordRegister(e.target.value)} required />
          </label>
          
          <input type="submit" value="Register"/>
        </form>
        <p> Login </p>
      </div> 
      {isLogged 
        ? <CondComponent1 />
        : <CondComponent2 />
      }

      
      
    </>
  )
}

const CondComponent1 = props => {
  return (
    <>
      <p> Je suis un GENTIL component conditionnel</p>
    </>
  )
}

const CondComponent2 = props => {

  return (
    <>
      <p> Je suis un VILAIN component conditionnel</p>
    </>
  )
}

export default App;