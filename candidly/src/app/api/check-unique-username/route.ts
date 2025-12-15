import { z } from 'zod'
import userModel from '@/models/User'
import dbConnect from '@/lib/dbConnect'
import { usernameValidation } from '@/schemas/signUpSchema'



const UsernameQuerySchema = z.object({
    username: usernameValidation
})


export async function GET(request: Request) {

    await dbConnect()

    try {

        // we are already validating the username, sign-up, sign-in, etc while getting response from DB using zod
        // but we are writing these files to validate these things while user is typing

        // we are trying to extract the query parameter from the url

        const { searchParams } = new URL(request.url)
        // searchParams example = localhost:3000/api/check-unique-username?username=abc?phone=android
        const queryParam = {
            username: searchParams.get('username')
            // queryParam will get username=abc from above string
        }

        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam)
        // console.log(result)
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json(
                {
                    success: false,
                    message: usernameErrors?.length > 0 ? usernameErrors.join(',') : 'Invalid query parameters',
                },
                { status: 400 },
            )
        }

        // if username is inputted properly by user then now we will check its existence in DB
        const { username } = result.data

        const existingVerifiedUser = await userModel.findOne({ username, isVerified: true })

        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: "This Username already exists. Please try again"
                },
                { status: 400 },
            )
        }

        // this is else part. username is not found in DD. that means unique and valid username
        return Response.json(
            {
                success: true,
                message: "This Username is available"
            },
            { status: 400 },
        )


    } catch (error) {
        console.error("Error checking username", error)

        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },
            { status: 500 },

        )
    }
}