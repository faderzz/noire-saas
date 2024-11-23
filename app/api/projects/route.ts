import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next"


export async function POST(req: Request) {
    const session = await getServerSession()
    if (session) {
        // Signed in
        // console.log("Session", JSON.stringify(session, null, 2))
    } else {
        // Not Signed in
        return new Response(
            "Unauthorised",
            {
                status: 401,
            }
        )
    }

    // Wait for the form data
    const formData = await req.json();
    console.log(formData)


}
