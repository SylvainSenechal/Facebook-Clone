import { useState, useEffect } from 'react';
import FriendList from './friendList';
import PostCreation from './PostCreation'
import ListPost from './ListPost'

const Dashboard = ({ user, setUser }) => {
  console.log(user)
  const [date, setDate] = useState(Math.floor(Date.now() / 1000))

  const tokenData64URL = user.token.split('.')[1]
  const tokenB64 = tokenData64URL.replace(/-/g, '+').replace(/_/g, '/')
  const tokenPayload = JSON.parse(atob(tokenB64))
  const { pseudo, userId, iat, exp } = tokenPayload

  console.log("token payload :", pseudo, userId, iat, exp)

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     console.log('oui')
  //     setDate(Math.floor(Date.now() / 1000))
  //   }, 1000)
  //   return () => clearTimeout(timer);
  // })

  const logout = () => {
    setUser(prev => ({ ...prev, loggedIn: false, token: "" }))
  }

  return (
    <>
      <p> Hello, you are connected as {pseudo}, user id is {userId} </p>
      <p> Your token is valid for {exp - date} second{(exp - date) > 1 ? 's' : ''} </p>
      <p> Your dashboard </p>
      <button onClick={logout}> Logout </button>
      <FriendList userId={userId} token={user.token} />
      <PostCreation userId={userId} token={user.token} />
      <ListPost userId={userId} token={user.token} />
    </>
  )
}

export default Dashboard;