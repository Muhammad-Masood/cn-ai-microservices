"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

const RecommendedTodos = ({ consumedTodos }: { consumedTodos: string[] }) => {
  const [todoRecom, setTodoRecom] = useState<string[]>([]);

  useEffect(() => {
    const sse = new EventSource(
      process.env.NEXT_PUBLIC_API_BASE_URL_CLIENT! + "/stream_events",
      {
        withCredentials: true,
      }
    );

    sse.onmessage = (event) => {
      const eventData = event.data;
      const filterEventData = eventData.startsWith("data")
        ? eventData.substring(5)
        : eventData;
      const parsedEventData = JSON.parse(filterEventData);
      const todoRecommendations: string[] = parsedEventData.message;
      console.log("Todo Recommendations -> ", todoRecommendations);
      setTodoRecom(todoRecommendations);
    };

    return () => {
      sse.close(); // Clean up the SSE connection on unmount
    };
  }, []);

  return (
    <div className="w-full sm:w-[70%] md:w-[35%] h-[500px] shadow-lg rounded-lg border">
      <p className="text-center pt-[2.5rem]">AI Recommendations for you</p>
      <div className="space-y-4 py-[2.5rem] px-[3rem]">
        {todoRecom.length === 0 ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        ) : (
          todoRecom.map((todo, index) => (
            <p
              className={`transition-opacity duration-500 ${
                todoRecom.length > 0
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-2"
              }`}
              key={index}
            >
              {todo}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendedTodos;
