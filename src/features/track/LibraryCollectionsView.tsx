import { FaFolder } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

type Props = {
  collections: string[];
  onSelectCollection: (collection: string) => void;
};

export const LibraryCollectionsView = ({
  collections,
  onSelectCollection,
}: Props) => (
  <div className="flex-1 overflow-auto p-4">
    <div className="h-10 flex items-center px-1">
      <div className="text-xs uppercase tracking-widest text-gray-500">
        COLLECTIONS
      </div>
    </div>

    <div className="grid gap-1">
      {collections.map((col) => (
        <Button
          key={col}
          variant="ghost"
          className="w-full justify-start h-10 text-left px-4 hover:bg-neutral-800"
          onClick={() => onSelectCollection(col)}
        >
          <FaFolder className="mr-3 h-4 w-4 text-gray-400" />
          <span className="truncate">{col}</span>
        </Button>
      ))}
    </div>
  </div>
);
