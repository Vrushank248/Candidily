import userModel from '@/models/User'
import dbConnect from '@/lib/dbConnect'


export async function POST(request: Request) {

    await dbConnect()

    try {
        // extract username and code from request
        const { username, code } = await request.json()

        // many times when we extract the elements from query parameters , it may contain some errors
        // so for safer side it is better to pass it from below method

        const decodedUsername = decodeURIComponent(username)
        const user = await userModel.findOne({ username: decodedUsername })


        // check if user exists
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found",
            },
                { status: 500, }
            )
        }

        // if user exist verify code and check its expiry
        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save()
            return Response.json({
                success: true,
                message: "Account Verified successfully",
            },
                { status: 200}
            )
        }
        else if(!isCodeValid){
            return Response.json({
                success: false,
                message: "Incorrect Verification Code",
            },
                { status: 400}
            )
        } else{
            return Response.json({
                success: false,
                message: "Verification code has expired. Please sign up again to get a new code",
            },
                { status: 400}
            )
        }


    } catch (error) {
        console.error("Error verifying User", error)

        return Response.json(
            {
                success: false,
                message: "Error verifying User"
            },
            { status: 500 },

        )
    }
}