import { useState, useEffect } from 'react';
import FriendList from './friendList';
import PostCreation from './PostCreation'
import ListPost from './ListPost'
import AddFriend from './AddFriend'
import ShowRequest from './ShowRequest'
import Footer from './Footer'

const Dashboard = ({ user, setUser }) => {
  console.log(user)
  const [date, setDate] = useState(Math.floor(Date.now() / 1000))
  const [refresh, setRefresh] = useState(0)

  const tokenData64URL = user.token.split('.')[1]
  const tokenB64 = tokenData64URL.replace(/-/g, '+').replace(/_/g, '/')
  const tokenPayload = JSON.parse(atob(tokenB64))
  const { pseudo, userId, iat, exp } = tokenPayload

  console.log("token payload :", pseudo, userId, iat, exp)

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearTimeout(timer);
  }, [])

  const logout = () => {
    window.localStorage.setItem('refreshToken', "")
    window.sessionStorage.setItem('refreshToken', "")
    setUser(prev => ({ ...prev, loggedIn: false, keepConnected: false, token: "", refreshToken: "" }))
  }

  return (
    <div id="dashboardOut">
      <div id="dashboardIn">
        <div id="infos" className="dashboardElement">
          <div> Hello {pseudo}, your id is {userId} </div>
          <div> Your token is valid for {exp - date} second{(exp - date) > 1 ? 's' : ''} </div>
        </div>
        <div id="logout" className="dashboardElement">
          <button onClick={logout}> Logout </button>
        </div>
        <FriendList token={user.token} />
        <div id="wall" className="dashboardElement">
          <PostCreation token={user.token} setRefresh={setRefresh} />
          <ListPost userId={userId} token={user.token} setRefresh={setRefresh} refresh={refresh} />
        </div>
        <div id="legals" className="dashboardElement"> Legals </div>
        <AddFriend token={user.token} />
        <ShowRequest userId={userId} token={user.token} />
        < Footer />
      </div>
    </div>
  )
}

export default Dashboard;