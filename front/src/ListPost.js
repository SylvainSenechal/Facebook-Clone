import { useState, useEffect } from 'react';

const ListPost = ({ userId, token, setRefresh, refresh }) => {
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
    setRefresh(refresh => refresh + 1)
    // const readableResult = await result.json()
  }

  return (
    <>
      <p> Hello, these are your friend's post </p>
      {
        posts.map(post => (
          post.id_poster === userId
            ? <div className="ownPost" key={post.idPost}>
              {/* <div className="idPost" > {post.poster_id} </div> */}
              <div className="pseudoPost" > {post.pseudo} </div>
              <div className="messagePost" > {post.content} </div>
              <div className="likesPost" >
                <button onClick={() => likePost(post.idPost)}> 👍 </button>
                {post.nbLikes}
                <div className="listOfLikers">
                  {post.likers.map(pseudoLiker => (
                    <div key={pseudoLiker}> {pseudoLiker}👍 </div>
                  ))}
                </div>
              </div>
            </div>
            : <div className="postFriend" key={post.idPost}>
              {/* <div className="idPost" > {post.poster_id} </div> */}
              <div className="pseudoPost" > {post.pseudo} </div>
              <div className="messagePost" > {post.content} </div>
              <div className="likesPost" >
                <button onClick={() => likePost(post.idPost)}> 👍 </button>
                {post.nbLikes}
                <div className="listOfLikers">
                  {post.likers.map(pseudoLiker => (
                    <div key={pseudoLiker}> {pseudoLiker}👍 </div>
                  ))}
                </div>
              </div>
            </div>
        ))
      }
    </>
  )
}

export default ListPost;