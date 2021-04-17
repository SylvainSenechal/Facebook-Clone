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
					id_friend1 INTEGER NOT NULL,
					id_friend2 INTEGER NOT NULL,
					pseudo_friend1 TEXT,
					pseudo_friend2 TEXT,
					FOREIGN KEY(id_friend1) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
					FOREIGN KEY(id_friend2) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
          CHECK (id_friend1 != id_friend2),
          PRIMARY KEY (id_friend1, id_friend2)
        )`
  )

  userCreation.run()
  friendshipCreation.run()
  const trigger = database.prepare(
    `CREATE TRIGGER IF NOT EXISTS duplicate_friendship BEFORE insert ON friendship
        BEGIN
        SELECT RAISE(ABORT, 'These 2 persons are already friends')
        WHERE EXISTS (SELECT 1
          FROM friendship
          WHERE 
          id_friend1 = new.id_friend2 AND 
          id_friend2 = new.id_friend1);
        END;
      `
  )
  trigger.run()
  // todo : add date post
  const postCreation = database.prepare(
    `CREATE TABLE IF NOT EXISTS
  			posts (
          id_post INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
					id_poster INTEGER NOT NULL,
					pseudo_poster TEXT,
          content TEXT,
          nb_likes INTEGER,
					FOREIGN KEY(id_poster) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
        )`
  )
  postCreation.run()

  const friendRequestCreation = database.prepare(
    `CREATE TABLE IF NOT EXISTS
  			friend_request (
          id_request INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
					id_asker INTEGER NOT NULL,
          id_asked INTEGER NOT NULL,
					pseudo_asker TEXT,
          pseudo_asked TEXT,
          FOREIGN KEY(id_asker) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
					FOREIGN KEY(id_asked) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
        )`
  )
  friendRequestCreation.run()

  // ----- Creating users -----

  const statement2 = database.prepare("INSERT INTO user (pseudo, password) VALUES (?, ?)")
  // statement2.run("vincent", "passw0rd hard")
  // statement2.run("denis", "passw0rd hard")
  // statement2.run("emmanuelle", "passw0rd hard")

  // ----- Inserting friends -----
  const statement3 = database.prepare("INSERT INTO friendship (id_friend1, id_friend2, pseudo_friend1, pseudo_friend2) VALUES (?, ?, ?, ?)")
  // try {
  //   statement3.run(1, 2, "sylvain", "vincent")
  // } catch (error) {
  //   console.log('err' + error)
  // }
  // try {
  //   statement3.run(1, 4, "sylvain", "emmanuelle")
  // } catch (error) {
  //   console.log('err' + error)
  // }

  const insertMessage = database.prepare("INSERT INTO posts (id_poster, pseudo_poster, content, nb_likes) VALUES (?, ?, ?, ?)")
  // insertMessage.run(4, "emmanuelle", "je suis emmanuelle", 0)
  // insertMessage.run(4, "emmanuelle", "je crois que je suis emmanuelle", 0)

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
  const statement6 = database.prepare("SELECT rowid, * FROM posts")
  console.log(statement6.all())

    // ----- Checking friend request -----
    console.log('POSTS : ')
    const statement7 = database.prepare("SELECT rowid, * FROM friend_request")
    console.log(statement7.all())
}

module.exports = createDatabase