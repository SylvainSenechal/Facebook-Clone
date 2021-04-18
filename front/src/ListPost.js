import { useState, useEffect } from 'react';

const ListPost = ({ userId, token, refresh }) => {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const getPostsList = async () => {
      // todo handle failed fetch
      const result = await fetch(`http://localhost:8080/posts`, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      const readableResult = await result.json()
      setPosts(readableResult.postsFound)
    }
    getPostsList()
  }, [refresh])

  const likePost = async postId => {
    const result = await fetch(`http://localhost:8080/likePost`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ postId: postId })
    })
    // const readableResult = await result.json()
  }

  return (
    <>
      <p> Hello, these are your friend's post </p>
      {
        posts.map(post => (
          post.id_poster === userId
            ? <div className="ownPost" key={post.idPost}>
              <div className="idPost" > {post.id_poster} </div>
              <div className="pseudoPost" > {post.pseudo} </div>
              <div className="messagePost" > {post.content} </div>
              <div className="likesPost" > {post.nb_likes} likes
                <div>
                  <button onClick={() => likePost(post.idPost)}> + </button>
                </div>
              </div>
            </div>
            : <div className="postFriend" key={post.idPost}>
              <div className="idPost" > {post.id_poster} </div>
              <div className="pseudoPost" > {post.pseudo} </div>
              <div className="messagePost" > {post.content} </div>
              <div className="likesPost" > {post.nb_likes} likes
                <div>
                  <button onClick={() => likePost(post.idPost)}> + </button>
                </div>
              </div>
            </div>
        ))
      }
    </>
  )
}

export default ListPost;