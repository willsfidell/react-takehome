import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'
import * as Yup from "yup";

// yup schema to be improved for file / data validation
// image part needs to proper validation
const schema = Yup.object().shape({
  title: Yup.string().required(),
  description: Yup.string().required(),
  image: Yup.mixed().required()
});


const prisma = new PrismaClient()
 
// basic crud stuff
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id !== null) {
    try {
      const post = await prisma.post.findUniqueOrThrow({
        where: {
          'id': id,
        }
      })
      return NextResponse.json(post)

    } catch (err) {
      if (err instanceof Prisma.NotFoundError) {
        return NextResponse.json({'error': 'Not found'}, {'status': 404})
      } else {
        return NextResponse.json({'error': err.message}, {'status': 500})
      }
    }
  } else {
    const posts = await prisma.post.findMany()
    return NextResponse.json(posts)
  }
}

export async function POST(request: Request) {

  const res = await request.json()

  // validate
  try {
    await schema.validate(res);
    res.createdAt = new Date() 
    const post = await prisma.post.create({data: res});
    return NextResponse.json({ post })

  } catch (err) {
    console.log(err)
    const message = err.errors.join(', ')
    return NextResponse.json({ 'error': message}, {'status': 422})
  }
}

export async function PUT(request: Request) {
  const res = await request.json()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id !== null) {
    // validate
    try {
      await schema.validate(res);
      const post = await prisma.post.update({id: id}, {data: res});
      return NextResponse.json({ post })

    } catch (err) {
      if (err instanceof ValidationError) {
        const message = err.errors.join(', ')
        return NextResponse.json({ 'error': message}, {'status': 422})
      }

      if (err instanceof Prisma.NotFoundError) {
        return NextResponse.json({'error': 'Not found'}, {'status': 404})
      } else {
        return NextResponse.json({'error': err.message}, {'status': 500})
      }
    }
  }
}


export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id !== null) {
  
    try {
      const post = await prisma.post.delete({
        where: {
          'id': id,
        },
      })
    } catch (err) {
      if (err instanceof Prisma.NotFoundError) {
        return NextResponse.json({'error': 'Not found'}, {'status': 404})
      } else {
        return NextResponse.json({'error': err.message}, {'status': 500})
      }
    }
  }
}
