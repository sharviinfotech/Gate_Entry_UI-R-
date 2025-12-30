import { Cast, MonitorSmartphone, ScreenShare, Tv } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCast } from '@/hooks/useCast';
import { toast } from 'sonner';

export function CastButton() {
  const location = useLocation();
  const {
    castSession,
    isChromecastAvailable,
    isScreenShareAvailable,
    startChromecast,
    openCastWindow,
    startScreenShare,
    stopCasting,
  } = useCast();

  const handleChromecast = async () => {
    const success = await startChromecast();
    if (success) {
      toast.success('Connected to Chromecast');
    } else {
      toast.error('Could not connect to Chromecast. Make sure your TV is on and on the same network.');
    }
  };

  const openCastView = async () => {
    const url = new URL(window.location.origin + location.pathname);
    const params = new URLSearchParams(location.search);
    params.set('cast', '1');
    url.search = params.toString();

    const res = await openCastWindow(url.toString());

    if (res.ok) {
      toast.success('Cast window opened - drag it to your external display');
      return;
    }

    if ('reason' in res && res.reason === 'popup_blocked') {
      toast.error('Popup blocked. Opening in this tab…');
      window.location.assign(url.toString());
      return;
    }

    toast.error('Could not open cast window.');
  };

  const handleScreenShare = async () => {
    const stream = await startScreenShare();
    if (stream) {
      toast.success('Screen sharing started');
    } else {
      toast.error('Screen sharing was cancelled or blocked');
    }
  };

  const handleStopCasting = () => {
    stopCasting();
    toast.success('Casting stopped');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-9 w-9 ${castSession.isConnected ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}
          aria-label="Cast options"
        >
          {castSession.isConnected ? (
            <MonitorSmartphone className="h-4 w-4" />
          ) : (
            <Cast className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem
          onClick={handleChromecast}
          disabled={!isChromecastAvailable}
          className="cursor-pointer"
        >
          <Tv className="mr-2 h-4 w-4" />
          {isChromecastAvailable ? 'Cast to Chromecast / TV' : 'Chromecast not available'}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={openCastView} className="cursor-pointer">
          <MonitorSmartphone className="mr-2 h-4 w-4" />
          Open Fullscreen Window
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleScreenShare}
          disabled={!isScreenShareAvailable}
          className="cursor-pointer"
        >
          <ScreenShare className="mr-2 h-4 w-4" />
          Share Screen
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleStopCasting}
          disabled={!castSession.isConnected}
          className="cursor-pointer"
        >
          Stop Casting
        </DropdownMenuItem>

        {!isChromecastAvailable && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Use Chrome/Edge browser for Chromecast support
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
