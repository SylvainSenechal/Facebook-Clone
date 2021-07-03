const getPosts = (database, userId) => {
	const getPosts = database.prepare(` -- Display post from a user or friends of user
	SELECT post.post_id, post.poster_id, post.content, user.pseudo, like.post_liked_id, count(like.post_liked_id) as nb_likes
	FROM post
	JOIN user on post.poster_id = user.user_id
	LEFT JOIN like ON like.post_liked_id = post.post_id
	WHERE EXISTS (SELECT 1
		FROM friendship
		WHERE (post.poster_id = friendship.id_friend1 OR post.poster_id = friendship.id_friend2) -- ID of poster must be in a friendship
		AND ? IN (friendship.id_friend1, friendship.id_friend2)) -- ID of current user MUST participate in that same friendship
	OR post.poster_id = ? -- Getting my own posts
	GROUP BY post.post_id
	`)
	const getLikers = database.prepare(`
		SELECT user.pseudo 
		FROM like
		JOIN user ON like.liker_id = user.user_id
		WHERE like.post_liked_id = ?
`)
	const postsProcessed = []
	const posts = getPosts.all(userId, userId)
	console.log(posts)
	database.transaction(() => {
		for (let post of posts) {
			const likers = getLikers.all(post.post_liked_id)
			postsProcessed.push({
				idPost: post.post_id,
				idPoster: post.poster_id,
				content: post.content,
				nbLikes: post.nb_likes,
				pseudo: post.pseudo,
				likers: likers.map(elem => elem.pseudo)
			})
		}
	})()
  return postsProcessed
}

const postPost = (database, userId, message) => {
  const insertMessage = database.prepare("INSERT INTO post (poster_id, content) VALUES (?, ?)")
	insertMessage.run(userId, message)
}

const likePost = (database, userId, postId) => {
  const like = database.prepare("INSERT INTO like (liker_id, post_liked_id) VALUES(?, ?)")
	like.run(userId, postId)
}

module.exports = {
  getPosts,
  postPost,
  likePost
}