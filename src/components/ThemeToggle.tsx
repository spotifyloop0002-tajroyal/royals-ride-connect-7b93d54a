import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const [isPremium, setIsPremium] = useState(true);

  useEffect(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "light") {
      setIsPremium(false);
      document.body.classList.remove("premium-dark");
    } else {
      // Default to premium theme
      setIsPremium(true);
      document.body.classList.add("premium-dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsPremium = !isPremium;
    setIsPremium(newIsPremium);

    if (newIsPremium) {
      document.body.classList.add("premium-dark");
      localStorage.setItem("theme", "premium");
    } else {
      document.body.classList.remove("premium-dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-md transition-all hover:bg-white/10"
      aria-label="Toggle theme"
    >
      {isPremium ? (
        <>
          <Moon size={18} className="text-[#D59B2B]" />
          <span className="text-xs font-medium text-[#D59B2B]">Premium</span>
        </>
      ) : (
        <>
          <Sun size={18} className="text-primary" />
          <span className="text-xs font-medium">Light</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
