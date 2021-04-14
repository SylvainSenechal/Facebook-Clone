import { useState, useEffect } from 'react';

const AddFriend = ({ userId, token }) => {

  const [friendSearch, setFriendSearch] = useState("")
  const [friendFound, setFriendFound] = useState([])

  useEffect(() => {
    const getFriendsRecommended = async () => {
      // todo handle failed fetch
      if (friendSearch !== "") {


        const result = await fetch(`http://localhost:8080/findFriends/${friendSearch}`, {
          method: 'GET', // *GET, POST, PUT, DELETE, etc.
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })
        const readableResult = await result.json()
        console.log(readableResult.friendsFound)
        setFriendFound(readableResult.friendsFound)
        console.log(friendFound)

      }
    }
    getFriendsRecommended()
  }, [friendSearch])

  const addFriend = async id => {
    console.log(id)
    const result = await fetch(`http://localhost:8080/friendRequest`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ idAsker: userId, idAsked: id })
    })
    const readableResult = await result.json()
    console.log(readableResult)
  }

  return (
    <div id="search" className="dashboardElement">
      <label htmlFor="pseudo"> Search a Friend:
        <input type="text" name="pseudo" value={friendSearch} onChange={e => setFriendSearch(e.target.value)} required />
      </label>
      <div id="potentialFriends" >
        <p> Add these friends : </p>
        <ul>
          {friendFound.map(friend => (
            <li key={friend.id}>
              pseudo : {friend.pseudo}, Friend id : {friend.id}
              <div id="addFriend" >
                <button onClick={() => addFriend(friend.id)}> + </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}

export default AddFriend;