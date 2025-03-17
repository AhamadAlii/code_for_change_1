import { useState, useEffect } from "react";
import { History, Trash2 } from "lucide-react";
import { getRecentSearches, clearDatabase } from "@/lib/indexedDB";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RecentSearchesProps {
  onSelectPincode: (pincode: string) => void;
  className?: string;
}

const RecentSearches = ({ onSelectPincode, className }: RecentSearchesProps) => {
  const [searches, setSearches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const loadSearches = async () => {
    setIsLoading(true);
    try {
      const recentSearches = await getRecentSearches();
      setSearches(recentSearches);
    } catch (error) {
      console.error("Error loading recent searches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSearches();
  }, []);

  const handleClearAll = async () => {
    try {
      await clearDatabase();
      setSearches([]);
      setOpen(false); // Close modal after clearing
    } catch (error) {
      console.error("Error clearing database:", error);
    }
  };

  if (searches.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className={cn("bg-white rounded-lg border border-border p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium flex items-center gap-2">
          <History size={16} />
          <span>Recent Searches</span>
        </h3>

        {searches.length > 0 && (
          <>
            <Button onClick={() => setOpen(true)} variant="ghost" className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
              <Trash2 size={14} />
              <span>Clear</span>
            </Button>

            {/* Clear Confirmation Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="max-w-md p-6 rounded-lg shadow-lg">
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogDescription>
                  Are you sure you want to clear all saved data? This will delete all offline hospital data.
                </DialogDescription>

                <div className="flex justify-end space-x-3 mt-4">
                  <Button variant="secondary" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleClearAll}>
                    Yes, Clear All
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {searches.map((search) => (
            <button
              key={search.pincode}
              onClick={() => onSelectPincode(search.pincode)}
              className="px-3 py-1 bg-secondary rounded-full text-sm hover:bg-secondary/80 transition-colors flex items-center gap-1"
            >
              <span>{search.pincode}</span>
              <span className="text-xs text-muted-foreground">({search.count})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentSearches;
