
import { Card, CardContent } from "@/components/ui/card";

interface ReadingSettings {
  font_size: number;
  font_family: string;
  line_height: number;
  theme: 'light' | 'dark' | 'comfort';
}

interface ChapterContentProps {
  content: string;
  readingSettings: ReadingSettings;
}

const ChapterContent = ({ content, readingSettings }: ChapterContentProps) => {
  const getThemeClasses = () => {
    switch (readingSettings.theme) {
      case 'light':
        return 'bg-white text-gray-900';
      case 'comfort':
        return 'bg-amber-50 text-amber-900';
      default:
        return 'bg-gray-800 text-gray-200';
    }
  };

  const getFontFamily = () => {
    switch (readingSettings.font_family) {
      case 'sans-serif':
        return 'font-sans';
      case 'monospace':
        return 'font-mono';
      default:
        return 'font-serif';
    }
  };

  return (
    <Card className="mb-8 bg-gray-800 border-gray-700 overflow-hidden">
      <CardContent className="p-0">
        <div 
          className={`p-4 md:p-8 ${getThemeClasses()} ${getFontFamily()}`}
          style={{
            fontSize: `${readingSettings.font_size}px`,
            lineHeight: readingSettings.line_height
          }}
        >
          <div className="prose prose-lg max-w-none">
            {content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChapterContent;
