import { useState, useEffect } from 'react';

const FriendList = ({ userId, token }) => {
  console.log('friendList userId :', userId)
  console.log('dashboard token :', token)

  const [friends, setFriends] = useState([])
  console.log(friends)
  friends.map(elem => console.log(elem))

  useEffect(() => {
    const getFriendList = async () => {
      const result = await fetch(`http://localhost:8080/friends/${userId}`, {
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
    <>
      <p> Hello, you are connected as {userId}, user id is {userId} </p>
      <ul>
        {friends.map(friend => (
          <li key={friend.id}>
            Friend id : {friend.id}, pseudo : {friend.pseudo}
          </li>
        ))}
      </ul>

    </>
  )
}

export default FriendList;