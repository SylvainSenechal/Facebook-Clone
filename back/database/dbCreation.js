const createDatabase = database => {
  const userCreation = database.prepare(
    `CREATE TABLE IF NOT EXISTS
      	user (
        	user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        	pseudo TEXT UNIQUE, 
	     		password TEXT
      	)`
  )
  const friendshipCreation = database.prepare(
    `CREATE TABLE IF NOT EXISTS
  			friendship (
					id_friend1 INTEGER NOT NULL, -- todo : rename friend_id1
					id_friend2 INTEGER NOT NULL,
					FOREIGN KEY(id_friend1) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
					FOREIGN KEY(id_friend2) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
          CHECK (id_friend1 != id_friend2),
          PRIMARY KEY (id_friend1, id_friend2)
        )`
  )
  const postCreation = database.prepare(
    `CREATE TABLE IF NOT EXISTS
  			post (
          post_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
					poster_id INTEGER NOT NULL,
          content TEXT,
					FOREIGN KEY(poster_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
        )`
  )
  const likeCreation = database.prepare(
    `CREATE TABLE IF NOT EXISTS
      like (
        like_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        liker_id INTEGER NOT NULL,
        post_liked_id INTERGER NOT NULL,
        FOREIGN KEY(liker_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(post_liked_id) REFERENCES post(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE(liker_id, post_liked_id)
      )`
  )
  const friendRequestCreation = database.prepare(
    `CREATE TABLE IF NOT EXISTS
  			friend_request (
          request_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
					asker_id INTEGER NOT NULL,
          asked_id INTEGER NOT NULL,
          FOREIGN KEY(asker_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
					FOREIGN KEY(asked_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
        )`
  )

  userCreation.run()
  friendshipCreation.run()
  postCreation.run()
  likeCreation.run()
  friendRequestCreation.run()

  // const triggerDuplicateFriendship = database.prepare(
  //   `CREATE TRIGGER IF NOT EXISTS duplicate_friendship BEFORE insert ON friendship
  //       BEGIN
  //       SELECT RAISE(ABORT, 'These 2 persons are already friends')
  //       WHERE EXISTS (SELECT 1
  //         FROM friendship
  //         WHERE 
  //         id_friend1 = new.id_friend2 AND 
  //         id_friend2 = new.id_friend1);
  //       END;
  //     `
  // )
  // triggerDuplicateFriendship.run()

  // ----- Checking users -----
  console.log('USERS : ')
  const statement4 = database.prepare("SELECT * FROM user")
  console.log(statement4.all())

  // ----- Checking friends -----
  console.log('FRIENDSHIPS : ')
  const statement5 = database.prepare("SELECT rowid, * FROM friendship")
  console.log(statement5.all())

  // ----- Checking posts -----
  console.log('POSTS : ')
  const statement6 = database.prepare("SELECT rowid, * FROM post")
  console.log(statement6.all())

  // ----- Checking friend request -----
  console.log('FRIEND REQUESTS : ')
  const statement7 = database.prepare("SELECT rowid, * FROM friend_request")
  console.log(statement7.all())

  // ----- Checking likes -----
  console.log('LIKES : ')
  const statement8 = database.prepare("SELECT rowid, * FROM like")
  console.log(statement8.all())

}

module.exports = createDatabase