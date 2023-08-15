'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import * as Yup from "yup";
import { useFormik } from 'formik';

const Blob = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Blob), { ssr: false })
const Dog = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Dog), { ssr: false })

// Use later in the task, if you'd like
const Duck = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Duck), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

// Should be own component file
const PostSaver = ({postId, closeSaver}) => {

  const schema = Yup.object().shape({                                             
    title: Yup.string().required(),                                               
    description: Yup.string().required(),                                         
  }); 

  const submitPost = async (values) => {

    // mock the imge
    const encodedData = btoa("Some images here"); // encode a string
    values.image = encodedData 

    // this would probably be better handled by react-query say
    fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify(values)
    }).then(response => {
      // Why doesn't fetch throw an error here when the status code is not 2XX
      // But this whole error reporting would need a complete overhaul
      if (response.status === 422) {
        response.text().then(message => {
          alert(message)
        })
      } else if (response.ok === true) {
        alert('Saved')
      } else {
        // Throw network / server errors
      }
      closeSaver()
    
    }).catch (err => {
      // TODO something proper here
      console.log(err)
    })
  }

  const formik = useFormik({
    initialValues: {
      title: '',
      description: ''
    },
    onSubmit: submitPost,
    validationSchema: schema
  });

  return (
  <>
    <p>Selected {postId}</p>
    <form onSubmit={formik.handleSubmit} >  
      <input type="text" name="title" placeholder="title"       onChange={formik.handleChange} />
      {formik.errors.title && (
      <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700" >{formik.errors.title}</div>
      )}

      <input type="text" name="description" placeholder="description"       onChange={formik.handleChange} />
      {formik.errors.description && (
      <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700" >{formik.errors.description}</div>
      )}

      <button id="button" type="submit" className="w-48 rounded-full bg-indigo-600 p-4 font-bold text-white shadow-xl hover:bg-indigo-500">Submit</button>
    </form>
  </>
  )
}


export default function Page() {

  const [selectedImage, setSelectedImage] = useState(-1)

  return (
    <>
      <div className='bg-gray-100'>
        <div className='mx-auto flex w-full flex-col md:w-4/5 md:flex-row md:px-12'>
          <div className='mx-auto flex w-fit items-center'>
            <div className='flex w-fit flex-col items-start px-6 pt-12 text-center md:text-left'>
              <h1 className='text-5xl font-bold leading-tight'>InstaGen</h1>
              <p className='mb-2 mt-[-10px] w-full uppercase text-blue-400'>A product by Gendo</p>
              <p className='mb-8 text-2xl leading-normal'>Generate and post your own custom images.</p>
            </div>
          </div>
          <View className='top-0 flex h-72 w-full flex-col items-center justify-center'>
            <Blob />
            <Common color={null} />
          </View>
        </div>
      </div>

      <div className='mx-auto flex w-full flex-col flex-wrap items-center px-12 md:flex-row lg:w-4/5'>
        <div className='relative h-96 w-full py-8 sm:w-1/2'>
          <View orbit className='relative h-full sm:w-full'>
            <Suspense fallback={null}>
              <Dog scale={2} position={[0, -1.6, 0]} rotation={[0.0, -0.3, 0]} />
              <Common color={'lightblue'} />
            </Suspense>
          </View>
        </div>
        <div className='relative h-48 w-full py-2 pl-8 sm:w-1/2 md:my-12'>
          <h2 className='mb-3 text-3xl font-bold leading-none text-gray-800'>Generate your image!</h2>
          <p className='mb-8 text-gray-600'>
            Drag, scroll, pinch, and rotate the canvas to frame your image, and then when you're happy, hit generate.
          </p>
          <div className='w-fit rounded-md border border-blue-400 p-2 text-blue-500 hover:cursor-pointer hover:bg-blue-50'>
            Generate
          </div>
        </div>
      </div>
      <div className='bg-gray-100 p-8'>
        <div className='mx-auto flex w-full flex-col flex-wrap items-center md:flex-row lg:w-4/5'>
          <div className='mx-auto grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:w-4/5 xl:grid-cols-6'>
            {(() => {
              // TODO!
              const images = []
              for (let i = 0; i < 12; i++) {
                images.push(<div key={i} className='h-32 w-32 rounded-md bg-white' onClick={() => {setSelectedImage(i)}}></div>)
              }
              return images
            })()}
          </div>
          {(selectedImage > -1) && <PostSaver postId={selectedImage} closeSaver={() => setSelectedImage(-1)} />}
        </div>
      </div>
    </>
  )
}
