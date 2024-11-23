import { getSession } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
    const session = await getSession();

    console.log(req)
    console.log("Session:", session)

    if (!session) {
        return new Response(
            "Unauthorised",
            {
                status: 401,
            }
          );
    }

}
