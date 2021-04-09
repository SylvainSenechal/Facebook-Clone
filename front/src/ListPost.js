import { useState, useEffect } from 'react';

const ListPost = ({ userId, token }) => {

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
  }, [])

  return (
    <>
      <p> Hello, these are your friends : </p>
      {
        posts.map(post => (
          <div key={post.idPost}> {post.pseudo} {post.content} {post.nb_likes}</div>
        ))
      }
      {/* <ul>
        {friends.map(friend => (
          <li key={friend.id}>
            Friend id : {friend.id}, pseudo : {friend.pseudo}
          </li>
        ))}
      </ul> */}

    </>
  )
}

export default ListPost;