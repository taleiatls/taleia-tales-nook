import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  List, 
  Home, 
  Minus, 
  Plus,
  Type,
  Palette
} from "lucide-react";

const ChapterReader = () => {
  const { id, chapterId } = useParams();
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("serif");
  const [lineHeight, setLineHeight] = useState(1.6);
  const [theme, setTheme] = useState("dark");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);

  // Mock data
  const novel = {
    title: "The Mystic Chronicles",
    author: "Elena Brightwater"
  };

  const currentChapter = {
    id: parseInt(chapterId || "1"),
    title: "Chapter 1: The Beginning",
    content: `
    The morning sun cast long shadows across the cobblestone streets of Eldoria as Aria Brightwater hurried through the market square. Her long auburn hair caught the light, creating a halo effect that seemed almost magical – which, given her heritage, wasn't entirely inaccurate.

    At seventeen, Aria had spent most of her life trying to blend in, to be ordinary in a world where being different could mean death. The Great Purge had ended twenty years ago, but its effects still rippled through society like stones thrown into a still pond. Magic users, once revered, were now feared and hunted.

    She pulled her hood up, casting her face in shadow as she navigated through the bustling crowd. The familiar weight of her leather satchel bumped against her hip with each step, filled with the herbs and potions her grandmother had taught her to make. To most people, she was simply an apothecary's apprentice. They had no idea of the power that coursed through her veins like liquid fire.

    "Aria!" A voice called out from behind her. She turned to see Marcus Ironwood jogging to catch up, his dark hair tousled from sleep and his academy uniform hastily thrown on. "Wait up!"

    She slowed her pace, allowing her childhood friend to fall into step beside her. Marcus had always been there – through scraped knees and broken hearts, through the long nights when nightmares about her parents' death kept her awake. He was one of the few people who knew her secret, and somehow, that knowledge hadn't driven him away.

    "You're early today," he observed, slightly out of breath. "Even for you."

    "Grandmother needed me to deliver some medicine to the old quarter before classes," she replied, adjusting her grip on the satchel. "Mrs. Henderson's arthritis is acting up again."

    Marcus nodded, but she could see the concern in his brown eyes. "You've been pushing yourself too hard lately. When's the last time you took a day off? Just for yourself?"

    Aria almost laughed at the question. Days off were a luxury she couldn't afford. Every moment spent not working, not helping, not proving her worth felt like a moment wasted. In a world that barely tolerated her existence, she had to be useful. She had to be necessary.

    "I'm fine," she said, the lie coming easily. "Besides, we have that history exam today. Professor Aldrich will have our heads if we're not prepared."

    The academy loomed before them, its ancient stones weathered by centuries of wind and rain. Gargoyles perched on the corners of the building, their stone eyes seeming to follow the students as they passed beneath. Legend said they had once been real guardians, turned to stone to protect the school from dark magic. Aria had always wondered if the legends were true.

    As they climbed the worn steps to the main entrance, Aria felt a familiar tingling sensation at the base of her skull. Magic. Someone nearby was using magic, and her innate sensitivity was picking up on it like a compass pointing north.

    She paused, scanning the crowd of students flowing around them. Most were focused on their books, their conversations, their normal teenage concerns. But there, near the fountain in the center of the courtyard, stood a figure that made her blood run cold.

    Tall and imposing, dressed in the dark robes of a Council Enforcer, the man's presence seemed to cast a shadow despite the bright morning sun. His pale eyes swept across the students with the cold efficiency of a predator hunting prey. A magical detector hung from his belt, its crystal surface pulsing with a faint blue light.

    "Aria?" Marcus's voice seemed to come from very far away. "What's wrong?"

    She realized she had stopped breathing. The Enforcer's gaze was moving methodically through the crowd, and she knew with absolute certainty that when those pale eyes found hers, everything would change.

    The detector's light grew brighter.
    `.trim()
  };

  const chapters = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Chapter ${i + 1}: ${["The Beginning", "First Steps", "Hidden Powers", "The Academy", "New Friends"][i] || "Untitled"}`
  }));

  const nextChapter = currentChapter.id < chapters.length ? currentChapter.id + 1 : null;
  const prevChapter = currentChapter.id > 1 ? currentChapter.id - 1 : null;

  const themeClasses = {
    light: "bg-white text-gray-900",
    dark: "bg-black text-white",
    comfort: "bg-amber-50 text-amber-900"
  };

  const fontClasses = {
    serif: "font-serif",
    sans: "font-sans"
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${themeClasses[theme as keyof typeof themeClasses]}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md ${
        theme === "dark" ? "bg-black/80 border-gray-800" : 
        theme === "comfort" ? "bg-amber-50/80 border-amber-200" :
        "bg-white/80 border-gray-200"
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className={theme === "dark" ? "text-gray-300 hover:text-gray-100" : ""}>
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={`/novel/${id}`}>
                <Button variant="ghost" size="sm" className={`text-left ${theme === "dark" ? "text-gray-300 hover:text-gray-100" : ""}`}>
                  <div>
                    <div className="font-medium text-sm">{novel.title}</div>
                    <div className="text-xs opacity-60">{currentChapter.title}</div>
                  </div>
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Sheet open={isChapterListOpen} onOpenChange={setIsChapterListOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className={theme === "dark" ? "text-gray-300 hover:text-gray-100" : ""}>
                    <List className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className={theme === "dark" ? "bg-gray-900 border-gray-700" : ""}>
                  <SheetHeader>
                    <SheetTitle className={theme === "dark" ? "text-gray-100" : ""}>Chapter List</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="mt-6 h-[calc(100vh-120px)]">
                    <div className="space-y-2">
                      {chapters.map((chapter) => (
                        <Link
                          key={chapter.id}
                          to={`/novel/${id}/chapter/${chapter.id}`}
                          onClick={() => setIsChapterListOpen(false)}
                        >
                          <div className={`p-3 rounded-lg border transition-colors ${
                            chapter.id === currentChapter.id 
                              ? theme === "dark" ? "bg-blue-900 border-blue-700" : "bg-amber-100 border-amber-300"
                              : theme === "dark" ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"
                          }`}>
                            <span className={`font-medium ${theme === "dark" ? "text-gray-200" : ""}`}>{chapter.title}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className={theme === "dark" ? "text-gray-300 hover:text-gray-100" : ""}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className={theme === "dark" ? "bg-gray-900 border-gray-700" : ""}>
                  <SheetHeader>
                    <SheetTitle className={theme === "dark" ? "text-gray-100" : ""}>Reading Settings</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Font Size */}
                    <div>
                      <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Font Size: {fontSize}px
                      </label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 text-center">{fontSize}px</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Font Family */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Font Family</label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="serif">Serif</SelectItem>
                          <SelectItem value="sans">Sans Serif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Line Height */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">
                        Line Height: {lineHeight}
                      </label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLineHeight(Math.max(1.2, lineHeight - 0.1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 text-center">{lineHeight.toFixed(1)}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLineHeight(Math.min(2.0, lineHeight + 0.1))}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Theme */}
                    <div>
                      <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "light", label: "Light", bg: "bg-white", text: "text-gray-900" },
                          { value: "dark", label: "Dark", bg: "bg-gray-900", text: "text-white" },
                          { value: "comfort", label: "Comfort", bg: "bg-amber-50", text: "text-amber-900" }
                        ].map((t) => (
                          <Button
                            key={t.value}
                            variant={theme === t.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme(t.value)}
                            className={`${t.bg} ${t.text} border-2`}
                          >
                            {t.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{currentChapter.title}</h1>
          <div className="flex items-center gap-2 text-sm opacity-60">
            <span>{novel.title}</span>
            <span>•</span>
            <span>by {novel.author}</span>
          </div>
        </div>

        <div 
          className={`prose max-w-none ${fontClasses[fontFamily as keyof typeof fontClasses]} ${theme === "dark" ? "prose-invert" : ""}`}
          style={{ 
            fontSize: `${fontSize}px`, 
            lineHeight: lineHeight,
            maxWidth: "none"
          }}
        >
          {currentChapter.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-6">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-800">
          {prevChapter ? (
            <Link to={`/novel/${id}/chapter/${prevChapter}`}>
              <Button variant="outline" className={`flex items-center gap-2 ${
                theme === "dark" ? "border-gray-600 text-white hover:bg-gray-900" : 
                theme === "comfort" ? "border-amber-300 text-amber-900 hover:bg-amber-100" :
                "border-gray-300 text-gray-900 hover:bg-gray-50"
              }`}>
                <ChevronLeft className="h-4 w-4" />
                Previous Chapter
              </Button>
            </Link>
          ) : (
            <div></div>
          )}

          {nextChapter ? (
            <Link to={`/novel/${id}/chapter/${nextChapter}`}>
              <Button className={`flex items-center gap-2 ${
                theme === "dark" ? "bg-blue-600 hover:bg-blue-700 text-white" :
                theme === "comfort" ? "bg-amber-600 hover:bg-amber-700 text-white" :
                "bg-blue-600 hover:bg-blue-700 text-white"
              }`}>
                Next Chapter
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChapterReader;
