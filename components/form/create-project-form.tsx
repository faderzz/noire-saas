"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import va from "@vercel/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import LoadingDots from "@/components/icons/loading-dots";

export default function CreateProjectForm({ onSuccess }) {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('agencyID', id);
    const formDataObj = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObj),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      va.track("Created Project");
      router.refresh();
      router.push("/projects");
      toast.success(`Successfully created project!`);
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <div className="grid grid-cols-1">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-tremor-content-strong dark:text-white">
            Project Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Enter project name"
            className="mt-1 w-full px-3 py-2 bg-white dark:bg-black border-tremor-border dark:border-gray-700 rounded-tremor-default shadow-tremor-input dark:shadow-dark-tremor-input text-tremor-content-strong dark:text-white"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium text-tremor-content-strong dark:text-white">
            Project Description
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter project description"
            className="mt-1 w-full px-3 py-2 bg-white dark:bg-black border-tremor-border dark:border-gray-700 rounded-tremor-default shadow-tremor-input dark:shadow-dark-tremor-input text-tremor-content-strong dark:text-white"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="status" className="text-sm font-medium text-tremor-content-strong dark:text-white">
          Status
        </Label>
        <Select name="status">
          <SelectTrigger id="status" className="mt-1 w-full bg-white dark:bg-black border-tremor-border dark:border-gray-700 text-tremor-content-strong dark:text-white">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-black">
            <SelectItem value="NOT_STARTED" className="text-tremor-content-strong dark:text-white">Not Started</SelectItem>
            <SelectItem value="IN_PROGRESS" className="text-tremor-content-strong dark:text-white">In Progress</SelectItem>
            <SelectItem value="COMPLETED" className="text-tremor-content-strong dark:text-white">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
          <Label htmlFor="priority" className="text-sm font-medium text-tremor-content-strong dark:text-white">
            Priority
          </Label>
          <Select name="priority">
            <SelectTrigger id="priority" className="mt-1 w-full bg-white dark:bg-black border-tremor-border dark:border-gray-700 text-tremor-content-strong dark:text-white">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-black">
              <SelectItem value="LOW" className="text-tremor-content-strong dark:text-white">Low</SelectItem>
              <SelectItem value="MEDIUM" className="text-tremor-content-strong dark:text-white">Medium</SelectItem>
              <SelectItem value="HIGH" className="text-tremor-content-strong dark:text-white">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

      <div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate" className="text-sm font-medium text-tremor-content-strong dark:text-white">
              Start Date
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              className="mt-1 w-full px-3 py-2 bg-white dark:bg-black border-tremor-border dark:border-gray-700 rounded-tremor-default shadow-tremor-input dark:shadow-dark-tremor-input text-tremor-content-strong dark:text-white"
            />
          </div>

          <div>
            <Label htmlFor="endDate" className="text-sm font-medium text-tremor-content-strong dark:text-white">
              End Date
            </Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              className="mt-1 w-full px-3 py-2 bg-white dark:bg-black border-tremor-border dark:border-gray-700 rounded-tremor-default shadow-tremor-input dark:shadow-dark-tremor-input text-tremor-content-strong dark:text-white"
            />
          </div>
        </div>

        
      </div>
      <div>
          <Label htmlFor="budget" className="text-sm font-medium text-tremor-content-strong dark:text-white">
            Budget
          </Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            step="0.01"
            placeholder="Enter budget"
            className="mt-1 w-full px-3 py-2 bg-white dark:bg-black border-tremor-border dark:border-gray-700 rounded-tremor-default shadow-tremor-input dark:shadow-dark-tremor-input text-tremor-content-strong dark:text-white"
          />
        </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-tremor-brand hover:bg-tremor-brand-emphasis text-tremor-brand-inverted dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white font-medium py-2 px-4 rounded-tremor-default transition-colors duration-200"
      >
        {isSubmitting ? <LoadingDots color="#FFFFFF" /> : "Create Project"}
      </Button>
    </form>
  );
}

