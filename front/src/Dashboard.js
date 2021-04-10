import { useState, useEffect } from 'react';
import FriendList from './friendList';
import PostCreation from './PostCreation'
import ListPost from './ListPost'
import Footer from './Footer'

const Dashboard = ({ user, setUser }) => {
  console.log(user)
  const [date, setDate] = useState(Math.floor(Date.now() / 1000))

  const tokenData64URL = user.token.split('.')[1]
  const tokenB64 = tokenData64URL.replace(/-/g, '+').replace(/_/g, '/')
  const tokenPayload = JSON.parse(atob(tokenB64))
  const { pseudo, userId, iat, exp } = tokenPayload

  console.log("token payload :", pseudo, userId, iat, exp)

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('oui')
      setDate(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearTimeout(timer);
  })

  const logout = () => {
    setUser(prev => ({ ...prev, loggedIn: false, token: "" }))
  }

  return (
    <div id="dashboardOut">
      <div id="dashboardIn">
        <div id="infos" class="dashboardElement">
          <div> Hello {pseudo}, your id is {userId} </div>
          <div> Your token is valid for {exp - date} second{(exp - date) > 1 ? 's' : ''} </div>
        </div>
        <div id="logout" class="dashboardElement">
          <button onClick={logout}> Logout </button>
        </div>
        <FriendList userId={userId} token={user.token} />
        <div id="wall" class="dashboardElement">
          <PostCreation userId={userId} token={user.token} />
          <ListPost userId={userId} token={user.token} />
        </div>
        <div id="legals" class="dashboardElement"> Legals </div>
        <div id="search" class="dashboardElement"> Search bar </div>
        < Footer />
      </div>
    </div>
  )
}

export default Dashboard;