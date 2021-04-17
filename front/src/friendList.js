import { useState, useEffect } from 'react';

const FriendList = ({ userId, token }) => {
  console.log('friendList userId :', userId)
  console.log('dashboard token :', token)

  const [friends, setFriends] = useState([])
  console.log(friends)

  useEffect(() => {
    const getFriendList = async () => {
      // todo handle failed fetch
      const result = await fetch(`http://localhost:8080/friends`, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      const readableResult = await result.json()
      setFriends(readableResult.friendsFound)
    }
    getFriendList()
  }, [])

  return (
    <div id="friends" className="dashboardElement">
      <p> Hello, these are your friends : </p>
      <ul>
        {friends.map(friend => (
          <li key={friend.id}>
            Friend id : {friend.id}, pseudo : {friend.pseudo}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FriendList;