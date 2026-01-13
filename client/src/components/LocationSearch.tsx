import { useState, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface LocationSearchProps {
  onSelect: (data: { name: string; lat: number; lng: number }) => void;
  defaultValue?: string;
  className?: string;
}

export default function LocationSearch({ onSelect, defaultValue = "", className = "" }: LocationSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounce Logic: Wait 500ms after typing before searching
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          // 🔥 FREE API: OpenStreetMap (Nominatim)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
          );
          const data = await response.json();
          setResults(data);
          setShowDropdown(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (place: any) => {
    setQuery(place.display_name.split(",")[0]); // Show short name in input
    setShowDropdown(false);
    
    // Pass data back to parent (Onboarding)
    onSelect({
      name: place.display_name, // Full address
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
    });
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        {/* <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /> */}
        <Input
          placeholder="Search your College/University..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`pl-9 bg-white/5 border-white/10 text-white ${className}`}
        />
        {loading && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 bg-[#09090b] border border-white/10 shadow-xl max-h-60 overflow-y-auto">
          {results.map((place) => (
            <div
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="p-3 hover:bg-white/10 cursor-pointer flex items-start gap-3 transition-colors border-b border-white/5 last:border-0"
            >
              <MapPin className="w-4 h-4 text-purple-500 mt-1 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">
                  {place.display_name.split(",")[0]}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {place.display_name}
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}