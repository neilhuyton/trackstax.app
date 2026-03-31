import { FaFolder } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

type Props = {
  subcategories: string[];
  onSelectSubcategory: (sub: string) => void;
};

export const LibrarySubcategoriesView = ({
  subcategories,
  onSelectSubcategory,
}: Props) => (
  <div className="px-4 pt-4 grid gap-1">
    {subcategories.map((sub) => (
      <Button
        key={sub}
        variant="ghost"
        className="w-full justify-start h-10 text-left px-4 hover:bg-neutral-800"
        onClick={() => onSelectSubcategory(sub)}
      >
        <FaFolder className="mr-3 h-4 w-4 text-gray-400" />
        <span className="truncate">{sub}</span>
      </Button>
    ))}
  </div>
);
