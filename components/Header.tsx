import Image from "next/image";

export function Header() {
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-1">
        <div className="flex items-center justify-center">
          <Image
            src="/VibeCheckTO Logo Design Skyline Alpha.png"
            alt="VibeCheckTO"
            width={300}
            height={90}
            className="h-20 w-auto"
            priority
          />
        </div>
      </div>
    </header>
  );
} 