/* 
    This was the migration script we used to migrate from
    our old database to the new Vercel Postgres database.
    It's not needed anymore, but I'm keeping it here for
    posterity.
*/

import { NextResponse } from "next/server";
// import db from "@/lib/db/db";

export async function GET() {
  //  Download data from old database
  //  const usersResult = await db.query.users.findMany();
  //  const accountsResult = await db.query.accounts.findMany();
  //  const agenciesResult = await db.query.agencies.findMany();
  //  const postsResult = await db.query.posts.findMany();;
  //  const examplesResult = await db.query.examples.findMany();;

  //  fs.writeFileSync("users.json", JSON.stringify(usersResult));
  //  fs.writeFileSync("accounts.json", JSON.stringify(accountsResult));
  //   fs.writeFileSync("agencies.json", JSON.stringify(agenciesResult));
  //   fs.writeFileSync("posts.json", JSON.stringify(postsResult));
  //   fs.writeFileSync("examples.json", JSON.stringify(examplesResult));

  // Upload data to new database
  //   const parsedUsers = JSON.parse(fs.readFileSync("users.json", "utf8"));
  //   const parsedAccounts = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
  //   const parsedAgencies = JSON.parse(fs.readFileSync("agencies.json", "utf8"));
  //   const parsedPosts = JSON.parse(fs.readFileSync("posts.json", "utf8"));
  //   const parsedExamples = JSON.parse(fs.readFileSync("examples.json", "utf8"));

  //   const response = await Promise.all([
  //     db.insert(users).values(parsedUsers),
  //     db.insert(accounts).values(parsedAccounts),
  //     db.insert(agencies).values(parsedAgencies),
  //     db.insert(posts).values(parsedPosts),
  //     db.insert(examples).values(parsedExamples)
  //   ]);

  return NextResponse.json({ response: "ok" });
}
