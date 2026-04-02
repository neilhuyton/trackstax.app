import { useState } from "react";

export function useSampleLibraryNavigation() {
  const [currentCollection, setCurrentCollection] = useState<string | null>(
    null,
  );
  const [currentSubcategory, setCurrentSubcategory] = useState<string | null>(
    null,
  );

  const goToCollection = (collection: string) => {
    setCurrentCollection(collection);
    setCurrentSubcategory(null);
  };

  const goBack = () => {
    setCurrentCollection(null);
    setCurrentSubcategory(null);
  };

  const goToSubcategory = (subcategory: string) => {
    setCurrentSubcategory(subcategory);
  };

  return {
    currentCollection,
    currentSubcategory,
    goToCollection,
    goToSubcategory,
    goBack,
  };
}
