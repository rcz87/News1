import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { ChannelConfig } from '@shared/schema';

interface ChannelContextType {
  channel: ChannelConfig | null;
  setChannel: (channel: ChannelConfig | null) => void;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export function ChannelProvider({
  children,
  initialChannel
}: {
  children: ReactNode;
  initialChannel: ChannelConfig | null;
}) {
  const [channel, setChannel] = useState<ChannelConfig | null>(initialChannel);

  // Update channel when initialChannel changes (from App.tsx)
  useEffect(() => {
    setChannel(initialChannel);
  }, [initialChannel]);

  return (
    <ChannelContext.Provider value={{
      channel,
      setChannel
    }}>
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannel() {
  const context = useContext(ChannelContext);
  if (context === undefined) {
    throw new Error('useChannel must be used within a ChannelProvider');
  }
  return context;
}
