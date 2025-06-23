
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

interface NotificationPaneProps {
  notifications: string[];
  onClear: () => void;
}

export const NotificationPane: React.FC<NotificationPaneProps> = ({
  notifications,
  onClear
}) => {
  const getNotificationIcon = (message: string) => {
    if (message.includes('✅') || message.includes('successfully')) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (message.includes('⚠️') || message.includes('conflict') || message.includes('missing')) {
      return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    }
    return <CheckCircle className="w-4 h-4 text-blue-600" />;
  };

  const getNotificationVariant = (message: string): "default" | "secondary" | "destructive" => {
    if (message.includes('✅') || message.includes('successfully')) {
      return 'default';
    } else if (message.includes('⚠️') || message.includes('conflict') || message.includes('missing')) {
      return 'destructive';
    }
    return 'secondary';
  };

  return (
    <Card className="p-4 h-fit">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">Notifications</h4>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {notifications.length}
          </Badge>
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-80">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <CheckCircle className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 bg-gray-50 rounded text-sm"
              >
                {getNotificationIcon(notification)}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-gray-700 leading-tight">
                      {notification.replace(/[✅⚠️]/g, '').trim()}
                    </span>
                    <Badge
                      variant={getNotificationVariant(notification)}
                      className="text-xs shrink-0"
                    >
                      {new Date().toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="mt-4 pt-4 border-t">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span>Success</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-blue-600" />
            <span>Info</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
