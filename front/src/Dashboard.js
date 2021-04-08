import { useState, useEffect } from 'react';
import FriendList from './friendList';

const Dashboard = ({user}) => {
  console.log(user)
  const [date, setDate] = useState(Math.floor(Date.now() / 1000))

  const tokenData64URL = user.token.split('.')[1]
  const tokenB64 = tokenData64URL.replace(/-/g, '+').replace(/_/g, '/')
  const tokenPayload = JSON.parse(atob(tokenB64))
  const {pseudo, userId, iat, exp} = tokenPayload

  console.log("token payload :", pseudo, userId, iat, exp)

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     console.log('oui')
  //     setDate(Math.floor(Date.now() / 1000))
  //   }, 1000)
  //   return () => clearTimeout(timer);
  // })

  return (
    <>
      <p> Hello, you are connected as {pseudo}, user id is {userId} </p>
      <p> Your token is valid for {exp - date} second{(exp - date) > 1 ? 's' : ''} </p>
      <p> Your dashboard </p>
      <FriendList userId={userId} token={user.token}/>

    </>
  )
}

export default Dashboard;