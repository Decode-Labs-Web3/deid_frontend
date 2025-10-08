import { Globe, Github, Linkedin } from "lucide-react";
import Image from "next/image";

export const ProfileCard = () => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex items-start gap-6">
      <Image
        src="/deid_logo.png"
        alt="Profile"
        width={112}
        height={112}
        className="w-28 h-28 rounded-2xl object-cover"
      />

      <div className="flex-1">
        <h2 className="text-3xl font-bold mb-1">Son Nguyen</h2>
        <p className="text-muted-foreground mb-3">@PasonDev</p>

        <div className="flex gap-3 mb-4">
          <Globe className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition" />
          <Github className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition" />
          <Linkedin className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition" />
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Lorem ipsum is placeholder text commonly used in the graphic, print,
          and publishing industries for previewing layouts and visual mockups.
        </p>
      </div>
    </div>
  );
};
