const createDatabase = database => {
  const userCreation = database.prepare(
    `CREATE TABLE IF NOT EXISTS
      	user (
        	user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        	pseudo TEXT, 
	     		password TEXT
      	)`
  )
  // friendship_id INTEGER PRIMARY KEY AUTOINCREMENT,

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

  // ----- Creating users -----

  const statement2 = database.prepare("INSERT INTO user (pseudo, password) VALUES (?, ?)")
  // statement2.run("sylvain", "$2b$10$G8y0G4Q4bjNTmM9H0.bGjeYbx0hQpaZ1WbzCkoIq67I2JC/asOOaK")
  // statement2.run("vincent", "passw0rd hard")
  // statement2.run("denis", "passw0rd hard")
  // statement2.run("emmanuelle", "passw0rd hard")

  // ----- Inserting friends -----
  const statement3 = database.prepare("INSERT INTO friendship (id_friend1, id_friend2, pseudo_friend1, pseudo_friend2) VALUES (?, ?, ?, ?)")
  try {
    statement3.run(1, 2, "sylvain", "vincent")
  } catch (error) {
    console.log('err' + error)
  }
  try {
    statement3.run(1, 4, "sylvain", "emmanuelle")
  } catch (error) {
    console.log('err' + error)
  }

  // ----- Checking users -----
  console.log('USERS : ')
  const statement4 = database.prepare("SELECT user_id, rowid, * FROM user")
  console.log(statement4.all())
  
  // ----- Checking friends -----
  console.log('FRIENDSHIPS : ')
  const statement5 = database.prepare("SELECT rowid, * FROM friendship")
  console.log(statement5.all())
}

module.exports = createDatabase