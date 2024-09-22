"use client";
import { deleteTodo, updateTodo } from "@/lib/server";
import { Todo } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

const TodoList = ({ todos }: { todos: Todo[] }) => {
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const router = useRouter();

  const handleUpdate = async () => {
    setIsUpdating(true);
    if (editingTodo) {
      console.log(editingTodo);
      await updateTodo(editingTodo);
      setEditingTodo(null);
      router.refresh();
    }
    setIsUpdating(false);
  };

  const handleTodoChange = (field: keyof Todo, value: any) => {
    if (editingTodo) {
      setEditingTodo({
        ...editingTodo,
        [field]: value,
      });
    }
    console.log(editingTodo);
  };

  return (
    <div className="flex flex-col gap-3">
      {todos.length ? (
        todos.map((todo: Todo) => (
          <div
            key={todo.id}
            className="flex p-2 rounded-md border cursor-pointer justify-between m-3"
          >
            <p onClick={() => setEditingTodo(todo)}>{todo.title}</p>
            <div className="flex space-x-2 items-center">
              <Badge variant={"outline"}>
                {!todo.status ? "Pending" : "Done"}
              </Badge>
              <Trash
                className="w-4 h-4"
                onClick={() => setDeletingTodoId(todo.id)}
              />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
              open={deletingTodoId === todo.id}
              onOpenChange={(open) => {
                if (!open) {
                  setDeletingTodoId(null);
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your todo item.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      if (deletingTodoId) {
                        await deleteTodo(deletingTodoId);
                        setDeletingTodoId(null);
                        router.refresh();
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Update Todo Dialog */}
            <Dialog
              open={editingTodo?.id === todo.id}
              onOpenChange={(open) => {
                if (!open) {
                  setEditingTodo(null);
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Todo</DialogTitle>
                  <DialogDescription>
                    Modify the details of your todo item.
                  </DialogDescription>
                  <div className="space-y-2">
                    <Input
                      id="title"
                      value={editingTodo?.title || ""}
                      onChange={(e) => handleTodoChange("title", e.target.value)}
                      className="col-span-3"
                    />
                    <Badge
                      className="cursor-pointer"
                      onClick={() => handleTodoChange("status", !editingTodo?.status)}
                    >
                      {!editingTodo?.status ? "Pending" : "Done"}
                    </Badge>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUpdate} disabled={isUpdating}>Update</Button>
                  </DialogFooter>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center">
          <p className="pt-[1rem]">No Todos</p>
        </div>
      )}
    </div>
  );
};

export default TodoList;
