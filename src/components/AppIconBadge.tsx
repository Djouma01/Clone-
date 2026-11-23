import { MessageCircle, Play, Send, Share2, Smartphone, Camera, Globe } from 'lucide-react';

interface AppIconBadgeProps {
  packageName: string;
  accentColor: string;
  size?: 'sm' | 'md';
}

export function AppIconBadge({ packageName, accentColor, size = 'md' }: AppIconBadgeProps) {
  const dims = size === 'sm' ? 'w-9 h-9 rounded-xl' : 'w-11 h-11 rounded-xl';
  const iconSize = size === 'sm' ? 18 : 20;

  const renderIcon = () => {
    switch (packageName) {
      case 'com.whatsapp':
      case 'com.whatsapp.w4b':
        return <MessageCircle size={iconSize} className="text-white" />;
      case 'com.facebook.katana':
        return <Share2 size={iconSize} className="text-white" />;
      case 'com.facebook.orca':
        return <MessageCircle size={iconSize} className="text-white" />;
      case 'com.zhiliaoapp.musically':
        return <Play size={iconSize} className="text-white" />;
      case 'org.telegram.messenger':
        return <Send size={iconSize} className="text-white" />;
      case 'com.instagram.android':
        return <Camera size={iconSize} className="text-white" />;
      default:
        return packageName.includes('browser') || packageName.includes('chrome') ? (
          <Globe size={iconSize} className="text-white" />
        ) : (
          <Smartphone size={iconSize} className="text-white" />
        );
    }
  };

  return (
    <div
      className={`${dims} flex items-center justify-center shrink-0 shadow-sm`}
      style={{ backgroundColor: accentColor }}
      aria-hidden="true"
    >
      {renderIcon()}
    </div>
  );
}
