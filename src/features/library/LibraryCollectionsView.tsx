import { FaFolder } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { toTitleCase } from "../utils/string-utils";

type Collection = {
  name: string;
  coverImage?: string | null;
  description?: string | null;
};

type Props = {
  collections: Collection[];
  onSelectCollection: (collection: string) => void;
};

export const LibraryCollectionsView = ({
  collections,
  onSelectCollection,
}: Props) => {
  if (collections.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-6 opacity-40">
          <FaFolder />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">
          No collections found
        </h3>
        <p className="text-gray-400 max-w-xs">
          There are no sample collections available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-3 py-2">
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-9 gap-2 md:gap-4">
        {collections.map((collection) => {
          const hasCover = !!collection.coverImage;
          const displayName = toTitleCase(collection.name);

          return (
            <Button
              key={collection.name}
              variant="ghost"
              className="group relative h-auto p-0 overflow-hidden bg-neutral-900 hover:bg-neutral-800 transition-all duration-300 flex flex-col active:scale-[0.97]"
              onClick={() => onSelectCollection(collection.name)}
            >
              <div className="relative w-full aspect-square overflow-hidden bg-neutral-950">
                {hasCover ? (
                  <img
                    src={collection.coverImage!}
                    alt={`${collection.name} cover`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-900">
                    <FaFolder className="h-8 w-8 text-gray-500" />
                  </div>
                )}
              </div>

              <div className="w-full text-center">
                <p className="font-sm text-sm leading-tight line-clamp-1 text-white group-hover:text-white">
                  {displayName}
                </p>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
