'use client'
import { useEffect, useState } from 'react'


export default function Page() {

  // should define post type
  const [posts, setPosts] = useState([])

  // if using something like react query we could make this redundant
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded === false) {
      fetch('/api/posts', {
        method: 'GET'
      }).then(response => {
        console.log(response)
        response.json().then((data) => {
          setPosts(data)
        })
        setLoaded(true)  
      })
    }
  },[loaded,setLoaded])
  
  return (
    <>
      <div className='p-6'>
        <h1 className='text-5xl font-bold'>Posts</h1>
        {posts.map((p) => {
          return (     
            <div key={p.id} >
              {p.title} {p.description} *image*
            </div>
          )
        })}
      </div>
    </>
  )
}
