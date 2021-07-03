import { useState, useEffect } from 'react';

const AddFriend = ({ token }) => {
  const [peopleSearch, setPeopleSearch] = useState("")
  const [foundPeople, setPeopleFound] = useState([])
  
  useEffect(() => {
    const getFriendsRecommended = async () => {
      // todo handle failed fetch
      console.log(`http://localhost:8080/findFriends/${peopleSearch}`)
      if (peopleSearch !== "") {
        const result = await fetch(`http://localhost:8080/findFriends/${peopleSearch}`, {
          method: 'GET', // *GET, POST, PUT, DELETE, etc.
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })
        const readableResult = await result.json()
        console.log(readableResult)
        setPeopleFound(readableResult.foundPeople)
      }
    }
    getFriendsRecommended()
  }, [peopleSearch])

  const addFriend = async id => {
    const result = await fetch(`http://localhost:8080/friendRequest`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ idAsked: id })
    })
    // const readableResult = await result.json()
  }

  return (
    <div id="search" className="dashboardElement">
      <label htmlFor="pseudo"> Search a Friend:
        <input type="text" name="pseudo" value={peopleSearch} onChange={e => setPeopleSearch(e.target.value)} required />
      </label>
      <div id="potentialFriends" >
        <p> Add these friends : </p>
        <ul>
          {foundPeople.map(friend => (
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