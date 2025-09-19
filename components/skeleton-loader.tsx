import { FC } from "react";
import { Skeleton } from "./ui/skeleton";

type props = {
  options?: string;
  rows?: number;
  columns?: number;
};

export const SkeletonLoader: FC<props> = ({
  options = "simple",
  rows = 5,
  columns = 4,
}) => {
  return (
    <>
      {options === "simple" && (
        <div className="flex items-center">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      )}
      {options === "table" && (
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {Array.from({ length: columns }).map((_, index) => (
                    <th key={index} className="p-2">
                      <Skeleton className="h-4 w-24" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                      <td key={colIndex} className="p-2">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
