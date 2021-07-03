const addFriend = (database, idAsker, idAsked) => {
  const statement = database.prepare("INSERT INTO friend_request (asker_id, asked_id) VALUES (?, ?)")
  statement.run(idAsker, idAsked)
}

const getPendingRequests = (database, userId) => {
  const statement = database.prepare(`
    SELECT friend_request.asker_id, user.pseudo 
    FROM friend_request 
    JOIN user ON friend_request.asker_id = user.user_id
    WHERE friend_request.asked_id = ?
  `)
  const pendingRequests = statement.all(userId)
  return pendingRequests.map(requester => ({ idAsker: requester.asker_id, pseudoAsker: requester.pseudo }))
}

const acceptFriendRequest = (database, idAsker, idAsked) => {
  const addFriend = database.prepare("INSERT INTO friendship (id_friend1, id_friend2) VALUES (?, ?)")
  const removeFriendRequest = database.prepare("DELETE FROM friend_request WHERE asker_id = ? AND asked_id = ?")
  try {
    addFriend.run(idAsker, idAsked)
    removeFriendRequest.run(idAsker, idAsked)
    removeFriendRequest.run(idAsked, idAsker)
  } catch (error) {
    console.log(error)
    console.log('Error friendship insertion')
    return res.status(401).json({ message: 'Error on friendship insertion' }) // todo voir comment gerer ça
  }
}

const getFriends = (database, userId) => {
  const getFriends1 = database.prepare(`
    SELECT friendship.id_friend2 as id_friend, user.pseudo 
    FROM friendship
    JOIN user ON friendship.id_friend2 = user.user_id
    WHERE id_friend1 = ?
  `)
  const getFriends2 = database.prepare(`
    SELECT friendship.id_friend1 as id_friend, user.pseudo 
    FROM friendship 
    JOIN user ON friendship.id_friend1 = user.user_id
    WHERE id_friend2 = ?
  `)
  const friends1 = getFriends1.all(userId)
  const friends2 = getFriends2.all(userId)
  let friends = []
  for (const friend of friends1) {
    friends.push({ id: friend.id_friend, pseudo: friend.pseudo })
  }
  for (const friend of friends2) {
    friends.push({ id: friend.id_friend, pseudo: friend.pseudo })
  }
  return friends
}

const searchPeople = (database, userId, name) => {
  const findPeople = database.prepare(`
    SELECT user_id, pseudo
    FROM user
    WHERE pseudo LIKE ?
    AND user_id != ?
  `)
  const foundPeople = findPeople.all(`%${name}%`, userId)
  return foundPeople.map(person => ({ id: person.user_id, pseudo: person.pseudo }))
}

module.exports = {
  addFriend,
  getPendingRequests,
  acceptFriendRequest,
  getFriends,
  searchPeople
}