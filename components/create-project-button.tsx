"use client";

import { useTransition } from "react";
import { createPost, createProject } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import LoadingDots from "@/components/icons/loading-dots";
import va from "@vercel/analytics";

export default function CreateProjectButton() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [isPending, startTransition] = useTransition();


  // ID is the agency ID.
  // Create the project button
  // Open a modal with form to create a project
  // On submit, call createProject function
  // Onclick -> Show a modal to create a project
  // On submit -> Call createProject function 
  // createProject will get the agency ID and current user's ID from the session
  // Verify the user in the session is the owner of the agency or team member
  // Create a new project with the agency ID and user ID and return the project
  return (
    <button
      onClick={() =>
        startTransition(async () => {
          // modal open
          // const post = await createProject(null, id, null);
          // va.track("Created Post");
          router.refresh();
          // router.push(`/post/${post.id}`);
        })
      }
      className={cn(
        "flex h-8 w-36 items-center justify-center space-x-2 rounded-lg border text-sm transition-all focus:outline-none sm:h-9",
        isPending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          : "border border-black bg-black text-white hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
      )}
      disabled={isPending}
    >
      {isPending ? <LoadingDots color="#808080" /> : <p>Create New Project</p>}
    </button>
  );
}
