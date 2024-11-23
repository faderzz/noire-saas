import { getServerSession } from "next-auth/next"
import db from "@/lib/db";
import { projects } from "@/lib/schema";

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

    const email = session.user?.email
    // Wait for the form data
    const formData = await req.json();
    // console.log(formData)

    // Get the user record
    const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email)
    })

    // Get agency record for formdata.agencyID
    const agency = await db.query.agencies.findFirst({
        where: (agencies, { eq }) => eq(agencies.id, formData.agencyID)
    })

    // Check if userId for agency matches the user.id
    if (agency?.userId !== user?.id) {
        return new Response(
            "Unauthorised",
            {
                status: 401,
            }
        )
    }

    // Create the project
    // const project = await db.query.projects({
    //     data: {
    //         name: formData.name,
    //         description: formData.description,
    //         status: formData.status,
    //         priority: formData.priority,
    //         startDate: new Date(formData.startDate),
    //         endDate: new Date(formData.endDate),
    //         agency: {
    //             connect: {
    //                 id: formData.agencyID
    //             }
    //         }
    //     }
    // })
    const [response] = await db
      .insert(projects)
      .values({
        agencyId: agency?.id,
        userId: user?.id,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        startDate: isNaN(Date.parse(formData.startDate)) ? null : new Date(formData.startDate).toISOString(),
        endDate: isNaN(Date.parse(formData.endDate)) ? null : new Date(formData.endDate).toISOString(),
      })
      .returning();
}
