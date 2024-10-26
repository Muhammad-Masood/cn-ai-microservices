"use client";
import * as z from "zod";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "Task is required!",
    })
    .max(100),
  status: z.boolean(),
});

type CreateBarValues = z.infer<typeof formSchema>;

// interface CreateBarProps {
//   initialData?: {
//     id: string;
//     task: String;
//   };
// }

// const CreateBar: React.FC<CreateBarProps> = ({ initialData }) => {
const CreateBar = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  //spinner
  const Icons = {
    spinner: Loader2,
  };

  const form = useForm<CreateBarValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      status: false,
    },
  });

  async function onSubmitHandler(todo: CreateBarValues) {
    setLoading(true);
    try {
      console.log(todo);
      // Produce data for broker
      // await produceTodoRecomData(todo.title);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL_CLIENT}/todo/create_and_produce`,
        todo
      );
      router.refresh();
    } catch (error) {
      console.log("TODO-ERROR", error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex items-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitHandler)}
          className="w-full flex gap-3 items-center"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                {/* <FormLabel>Task</FormLabel> */}
                <FormMessage />
                <FormControl>
                  <Input
                    placeholder="Enter task"
                    {...field}
                    autoFocus
                    className={"w-[325px]"}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit">
            {loading ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
              "Create"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateBar;
