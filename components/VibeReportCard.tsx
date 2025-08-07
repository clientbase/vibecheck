import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VibeReport } from "@/lib/types";
import { VibeLevel, QueueLength, VibeLevelType, QueueLengthType } from "@/lib/constants";

type VibeReportCardProps = {
  report: VibeReport;
};

export function VibeReportCard({ report }: VibeReportCardProps) {
  const getTimeSincePosted = (submittedAt: Date | string) => {
    const now = new Date();
    const posted = new Date(submittedAt);
    const diffInSeconds = Math.floor((now.getTime() - posted.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months}mo ago`;
    }
  };

  const getVibeLevelColor = (level: VibeLevelType) => {
    switch (level) {
      case VibeLevel.DEAD: return "text-red-500";
      case VibeLevel.MID: return "text-yellow-500";
      case VibeLevel.LIT: return "text-green-500";
      case VibeLevel.CHAOTIC: return "text-purple-500";
      default: return "text-gray-500";
    }
  };

  const getQueueLengthColor = (length: QueueLengthType) => {
    switch (length) {
      case QueueLength.NONE: return "text-green-500";
      case QueueLength.SHORT: return "text-yellow-500";
      case QueueLength.LONG: return "text-orange-500";
      case QueueLength.INSANE: return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getVibeLevelIcon = (level: VibeLevelType) => {
    switch (level) {
      case VibeLevel.DEAD: return "💀";
      case VibeLevel.MID: return "😐";
      case VibeLevel.LIT: return "🔥";
      case VibeLevel.CHAOTIC: return "🤪";
      default: return "🎵";
    }
  };

  const getQueueLengthIcon = (length: QueueLengthType) => {
    switch (length) {
      case QueueLength.NONE: return "✅";
      case QueueLength.SHORT: return "⏳";
      case QueueLength.LONG: return "😤";
      case QueueLength.INSANE: return "😱";
      default: return "🎵";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">{getVibeLevelIcon(report.vibeLevel)}</span>
            <span className={getVibeLevelColor(report.vibeLevel)}>
              {report.vibeLevel}
            </span>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {getTimeSincePosted(report.submittedAt)}
          </div>
        </div>
      </CardHeader>
      
      {(report.queueLength || report.coverCharge || report.musicGenre || report.notes || report.imageUrl) && (
        <CardContent className="space-y-3">
          {report.imageUrl && (
            <div className="mb-3">
              <img
                src={report.imageUrl}
                alt="Vibe report image"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
          
          {(report.queueLength || report.coverCharge) && (
            <div className="flex items-center justify-between">
              {report.queueLength && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getQueueLengthIcon(report.queueLength)}</span>
                  <span className={`font-medium ${getQueueLengthColor(report.queueLength)}`}>
                    Queue: {report.queueLength}
                  </span>
                </div>
              )}
              {report.coverCharge && (
                <div className="text-sm font-medium text-muted-foreground">
                  ${report.coverCharge} cover
                </div>
              )}
            </div>
          )}
          
          {report.musicGenre && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Music:</span>
              <span className="font-medium">{report.musicGenre}</span>
            </div>
          )}
          
          {report.notes && (
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{report.notes}&rdquo;
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
} 