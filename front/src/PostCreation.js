import { useState } from 'react';

const PostCreation = ({ token, setRefresh }) => {
  const [message, setMessage] = useState("")

  const sendNewPost = async event => {
    event.preventDefault()

    const result = await fetch('http://localhost:8080/newPost', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: message })
    })
    // const readableResult = await result.json()
    setRefresh(refresh => refresh + 1)
  }

  return (

    <form id="postMessage" onSubmit={sendNewPost}>
      <label htmlFor="postMessage"> Write a new post </label>
      <textarea name="postMessage" rows="2" col="20" value={message} onChange={e => setMessage(e.target.value)}> </textarea>
      <input type="submit" value="Post new message" />
    </form>

  )
}

export default PostCreation;