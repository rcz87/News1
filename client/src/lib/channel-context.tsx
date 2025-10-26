import { createContext, useContext, ReactNode } from 'react';
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
  return (
    <ChannelContext.Provider value={{ 
      channel: initialChannel,
      setChannel: () => {} 
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
