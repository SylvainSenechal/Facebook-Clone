import { useState, useEffect } from 'react';

const ListPost = ({ userId, token, refresh }) => {

  const [posts, setPosts] = useState([])
  console.log(posts)

  useEffect(() => {
    const getPostsList = async () => {
      // todo handle failed fetch
      const result = await fetch(`http://localhost:8080/posts/${userId}`, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      const readableResult = await result.json()
      console.log(readableResult)
      setPosts(readableResult.postsFound)
      console.log(posts)
    }
    getPostsList()
  }, [refresh])

  return (
    <>
      <p> Hello, these are your friend's post </p>
      {
        posts.map(post => (
          post.id_poster === userId
            ? <div className="ownPost" key={post.idPost}>
              <div> {post.id_poster} </div>
              <div> {post.pseudo} </div>
              <div> {post.content} </div>
              <div> {post.nb_likes} </div>
            </div>
            : <div className="postFriend" key={post.idPost}>
              <div> {post.id_poster} </div>
              <div> {post.pseudo} </div>
              <div> {post.content} </div>
              <div> {post.nb_likes} </div>
            </div>
        ))
      }
    </>
  )
}

export default ListPost;