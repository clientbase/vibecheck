import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VibeReport, VibeLevel, QueueLength } from "@/lib/types";

type VibeReportCardProps = {
  report: VibeReport;
};

export function VibeReportCard({ report }: VibeReportCardProps) {
  const getVibeLevelColor = (level: VibeLevel) => {
    switch (level) {
      case VibeLevel.DEAD: return "text-red-500";
      case VibeLevel.MID: return "text-yellow-500";
      case VibeLevel.LIT: return "text-green-500";
      case VibeLevel.CHAOTIC: return "text-purple-500";
      default: return "text-gray-500";
    }
  };

  const getQueueLengthColor = (length: QueueLength) => {
    switch (length) {
      case QueueLength.NONE: return "text-green-500";
      case QueueLength.SHORT: return "text-yellow-500";
      case QueueLength.LONG: return "text-orange-500";
      case QueueLength.INSANE: return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getVibeLevelIcon = (level: VibeLevel) => {
    switch (level) {
      case VibeLevel.DEAD: return "💀";
      case VibeLevel.MID: return "😐";
      case VibeLevel.LIT: return "🔥";
      case VibeLevel.CHAOTIC: return "🤪";
      default: return "🎵";
    }
  };

  const getQueueLengthIcon = (length: QueueLength) => {
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
            {new Date(report.submittedAt).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getQueueLengthIcon(report.queueLength)}</span>
            <span className={`font-medium ${getQueueLengthColor(report.queueLength)}`}>
              Queue: {report.queueLength}
            </span>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            ${report.coverCharge} cover
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Music:</span>
          <span className="font-medium">{report.musicGenre}</span>
        </div>
        
        {report.notes && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground italic">
              &ldquo;{report.notes}&rdquo;
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 