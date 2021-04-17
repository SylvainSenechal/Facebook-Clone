import { useState, useEffect } from 'react';

const ShowRequest = ({ userId, token }) => {
  console.log('friendList userId :', userId)
  console.log('dashboard token :', token)

  const [request, setRequest] = useState([])

  useEffect(() => {
    const getFriendRequest = async () => {
      // todo handle failed fetch
      const result = await fetch(`http://localhost:8080/friendRequest`, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      const readableResult = await result.json()
      setRequest(readableResult.friendsRequest)
      console.log(readableResult)
    }
    getFriendRequest()
  }, [])

  const acceptFriend = async id => {
    console.log(id)
    const result = await fetch(`http://localhost:8080/acceptRequest`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ idAsker: id, idAsked: userId })
    })
    const readableResult = await result.json()
    console.log(readableResult)
  }

  return (
    <div id="showRequest" className="dashboardElement">
      <p> Friend Request list : </p>
      <ul>
        {request.map(friend => (
          <li key={friend.idAsker}>
            pseudo : {friend.pseudoAsker}, Friend id : {friend.idAsker}
            <div id="acceptFriend" >
              <button onClick={() => acceptFriend(friend.idAsker)}> accept </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ShowRequest;