import { useState, useEffect } from 'react';

const PostCreation = ({ userId, token, setRefresh }) => {
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
    const readableResult = await result.json()
    console.log(readableResult)
    setRefresh(refresh => refresh + 1)
  }

  return (

    <form onSubmit={sendNewPost}>
      <label>
        Write a new post :
        <textarea value={message} onChange={e => setMessage(e.target.value)}> </textarea>
      </label>
      <input type="submit" value="Post new message" />
    </form>

  )
}

export default PostCreation;